package worker

import (
	"bufio"
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/haseen-me/haseen-apps/services/mail/internal/dkim"
	"github.com/haseen-me/haseen-apps/services/mail/internal/model"
	smtppkg "github.com/haseen-me/haseen-apps/services/mail/internal/smtp"
	"github.com/haseen-me/haseen-apps/services/mail/internal/store"
	"github.com/rs/zerolog"
)

type RelayWorker struct {
	Store    *store.Store
	Sender   *smtppkg.Sender
	Log      zerolog.Logger
	Interval time.Duration
	quit     chan struct{}
}

func NewRelayWorker(st *store.Store, sender *smtppkg.Sender, log zerolog.Logger, interval time.Duration) *RelayWorker {
	return &RelayWorker{
		Store:    st,
		Sender:   sender,
		Log:      log.With().Str("component", "relay-worker").Logger(),
		Interval: interval,
		quit:     make(chan struct{}),
	}
}

func (w *RelayWorker) Start() {
	go w.run()
}

func (w *RelayWorker) Stop() {
	close(w.quit)
}

func (w *RelayWorker) run() {
	ticker := time.NewTicker(w.Interval)
	defer ticker.Stop()

	w.Log.Info().Dur("interval", w.Interval).Msg("relay worker started")

	for {
		select {
		case <-ticker.C:
			w.processQueue()
		case <-w.quit:
			w.Log.Info().Msg("relay worker stopped")
			return
		}
	}
}

func (w *RelayWorker) processQueue() {
	ctx := context.Background()
	messages, err := w.Store.GetQueuedMessages(ctx, 10)
	if err != nil {
		w.Log.Error().Err(err).Msg("failed to fetch queued messages")
		return
	}

	for i := range messages {
		w.sendMessage(ctx, &messages[i])
	}
}

func (w *RelayWorker) sendMessage(ctx context.Context, msg *model.OutboundMessage) {
	env := &smtppkg.Envelope{
		From:    msg.FromAddress,
		To:      msg.ToAddresses,
		Subject: msg.Subject,
		HTML:    msg.BodyHTML,
		Text:    msg.BodyText,
		Headers: make(map[string]string),
	}

	if msg.DomainID != nil && *msg.DomainID != "" {
		dkimSig, err := w.signWithDKIM(ctx, *msg.DomainID, env)
		if err != nil {
			w.Log.Warn().Err(err).Str("msgID", msg.ID).Msg("DKIM signing failed, sending without signature")
		} else if dkimSig != "" {
			env.Headers["DKIM-Signature"] = dkimSig
		}
	}

	allRecipients := make([]string, 0, len(msg.ToAddresses)+len(msg.CcAddresses)+len(msg.BccAddresses))
	allRecipients = append(allRecipients, msg.ToAddresses...)
	allRecipients = append(allRecipients, msg.CcAddresses...)
	allRecipients = append(allRecipients, msg.BccAddresses...)
	env.To = allRecipients

	if err := w.Sender.Send(env); err != nil {
		w.Log.Error().Err(err).Str("msgID", msg.ID).Msg("delivery failed")
		w.Store.MarkMessageFailed(ctx, msg.ID, err.Error(), msg.Attempts, msg.MaxAttempts)
		return
	}

	w.Store.MarkMessageSent(ctx, msg.ID)
	w.Log.Info().Str("msgID", msg.ID).Str("from", msg.FromAddress).Msg("message delivered")
}

func (w *RelayWorker) signWithDKIM(ctx context.Context, domainID string, env *smtppkg.Envelope) (string, error) {
	dkimKey, err := w.Store.GetActiveDKIMKey(ctx, domainID)
	if err != nil {
		return "", fmt.Errorf("get DKIM key: %w", err)
	}

	domain, err := w.Store.GetDomainByDKIMKey(ctx, dkimKey.DomainID)
	if err != nil {
		return "", fmt.Errorf("get domain for DKIM: %w", err)
	}

	privKey, err := dkim.DecryptPrivateKey(dkimKey.PrivateKeyEnc, dkimKey.PrivateKeyIV)
	if err != nil {
		return "", fmt.Errorf("decrypt DKIM key: %w", err)
	}

	var headerBlock strings.Builder
	hw := bufio.NewWriter(&headerBlock)
	fmt.Fprintf(hw, "From: %s\r\n", env.From)
	fmt.Fprintf(hw, "To: %s\r\n", strings.Join(env.To, ", "))
	fmt.Fprintf(hw, "Subject: %s\r\n", env.Subject)
	fmt.Fprintf(hw, "Date: %s\r\n", time.Now().Format(time.RFC1123Z))
	hw.Flush()

	opts := &dkim.SignOptions{
		PrivateKey: privKey,
		Domain:     domain,
		Selector:   dkimKey.Selector,
		Headers:    []string{"from", "to", "subject", "date"},
		Body:       env.HTML,
	}

	sig, err := dkim.Sign(opts, headerBlock.String())
	if err != nil {
		return "", fmt.Errorf("DKIM sign: %w", err)
	}

	return sig, nil
}
