package worker

import (
	"context"
	"fmt"
	"net"
	"strings"
	"time"

	"github.com/haseen-me/haseen-apps/services/mail/internal/model"
	"github.com/haseen-me/haseen-apps/services/mail/internal/store"
	"github.com/rs/zerolog"
)

type DNSWorker struct {
	Store      *store.Store
	Log        zerolog.Logger
	MailDomain string
	Interval   time.Duration
	quit       chan struct{}
}

func NewDNSWorker(st *store.Store, log zerolog.Logger, mailDomain string, interval time.Duration) *DNSWorker {
	return &DNSWorker{
		Store:      st,
		Log:        log.With().Str("component", "dns-worker").Logger(),
		MailDomain: mailDomain,
		Interval:   interval,
		quit:       make(chan struct{}),
	}
}

func (w *DNSWorker) Start() {
	go w.run()
}

func (w *DNSWorker) Stop() {
	close(w.quit)
}

func (w *DNSWorker) run() {
	ticker := time.NewTicker(w.Interval)
	defer ticker.Stop()

	w.Log.Info().Dur("interval", w.Interval).Msg("DNS verification worker started")

	w.checkAll()

	for {
		select {
		case <-ticker.C:
			w.checkAll()
		case <-w.quit:
			w.Log.Info().Msg("DNS verification worker stopped")
			return
		}
	}
}

func (w *DNSWorker) checkAll() {
	ctx := context.Background()
	domains, err := w.Store.GetPendingDomains(ctx)
	if err != nil {
		w.Log.Error().Err(err).Msg("failed to get pending domains")
		return
	}

	for i := range domains {
		w.checkDomain(ctx, &domains[i])
	}
}

func (w *DNSWorker) checkDomain(ctx context.Context, domain *model.CustomDomain) {
	w.Log.Debug().Str("domain", domain.Domain).Msg("checking DNS records")

	mxOK := w.checkMX(ctx, domain.ID, domain.Domain)
	spfOK := w.checkSPF(ctx, domain.ID, domain.Domain, domain.VerificationToken)
	dkimOK := w.checkDKIM(ctx, domain.ID, domain.Domain)
	dmarcOK := w.checkDMARC(ctx, domain.ID, domain.Domain)

	if err := w.Store.UpdateDomainVerification(ctx, domain.ID, mxOK, spfOK, dkimOK, dmarcOK); err != nil {
		w.Log.Error().Err(err).Str("domain", domain.Domain).Msg("failed to update verification status")
	}

	w.Log.Info().
		Str("domain", domain.Domain).
		Bool("mx", mxOK).
		Bool("spf", spfOK).
		Bool("dkim", dkimOK).
		Bool("dmarc", dmarcOK).
		Msg("DNS check complete")
}

func (w *DNSWorker) checkMX(ctx context.Context, domainID, domainName string) bool {
	expectedHost := "mail." + w.MailDomain
	records, err := net.LookupMX(domainName)
	if err != nil {
		w.Store.LogDNSCheck(ctx, domainID, "mx", false, expectedHost, fmt.Sprintf("error: %v", err))
		return false
	}

	for _, r := range records {
		host := strings.TrimSuffix(r.Host, ".")
		if strings.EqualFold(host, expectedHost) {
			w.Store.LogDNSCheck(ctx, domainID, "mx", true, expectedHost, host)
			return true
		}
	}

	var actualHosts []string
	for _, r := range records {
		actualHosts = append(actualHosts, strings.TrimSuffix(r.Host, "."))
	}
	w.Store.LogDNSCheck(ctx, domainID, "mx", false, expectedHost, strings.Join(actualHosts, ", "))
	return false
}

func (w *DNSWorker) checkSPF(ctx context.Context, domainID, domainName, token string) bool {
	expectedInclude := "include:" + w.MailDomain
	records, err := net.LookupTXT(domainName)
	if err != nil {
		w.Store.LogDNSCheck(ctx, domainID, "spf", false, expectedInclude, fmt.Sprintf("error: %v", err))
		return false
	}

	for _, txt := range records {
		if strings.HasPrefix(txt, "v=spf1") && strings.Contains(txt, expectedInclude) {
			w.Store.LogDNSCheck(ctx, domainID, "spf", true, expectedInclude, txt)
			return true
		}
	}

	w.Store.LogDNSCheck(ctx, domainID, "spf", false, expectedInclude, strings.Join(records, "; "))
	return false
}

func (w *DNSWorker) checkDKIM(ctx context.Context, domainID, domainName string) bool {
	dkimKey, err := w.Store.GetActiveDKIMKey(ctx, domainID)
	if err != nil {
		w.Store.LogDNSCheck(ctx, domainID, "dkim", false, "", "no active DKIM key")
		return false
	}

	selector := dkimKey.Selector
	dkimDomain := selector + "._domainkey." + domainName
	records, err := net.LookupTXT(dkimDomain)
	if err != nil {
		w.Store.LogDNSCheck(ctx, domainID, "dkim", false, "v=DKIM1; k=rsa; p=...", fmt.Sprintf("error: %v", err))
		return false
	}

	pubKeyTrimmed := strings.ReplaceAll(dkimKey.PublicKey, "\n", "")
	for _, txt := range records {
		combined := strings.ReplaceAll(txt, " ", "")
		if strings.Contains(combined, "v=DKIM1") && strings.Contains(combined, "k=rsa") {
			if len(pubKeyTrimmed) >= 32 && strings.Contains(combined, pubKeyTrimmed[:32]) {
				w.Store.LogDNSCheck(ctx, domainID, "dkim", true, "v=DKIM1; k=rsa; p=...", txt)
				return true
			}
		}
	}

	w.Store.LogDNSCheck(ctx, domainID, "dkim", false, "v=DKIM1; k=rsa; p=...", strings.Join(records, "; "))
	return false
}

func (w *DNSWorker) checkDMARC(ctx context.Context, domainID, domainName string) bool {
	dmarcDomain := "_dmarc." + domainName
	records, err := net.LookupTXT(dmarcDomain)
	if err != nil {
		w.Store.LogDNSCheck(ctx, domainID, "dmarc", false, "v=DMARC1; ...", fmt.Sprintf("error: %v", err))
		return false
	}

	for _, txt := range records {
		if strings.HasPrefix(txt, "v=DMARC1") {
			w.Store.LogDNSCheck(ctx, domainID, "dmarc", true, "v=DMARC1; ...", txt)
			return true
		}
	}

	w.Store.LogDNSCheck(ctx, domainID, "dmarc", false, "v=DMARC1; ...", strings.Join(records, "; "))
	return false
}

// CheckDomainDirect runs an on-demand DNS check for a specific domain.
func (w *DNSWorker) CheckDomainDirect(ctx context.Context, domainID string, userID string) error {
	domain, err := w.Store.GetDomain(ctx, domainID, userID)
	if err != nil {
		return err
	}
	w.checkDomain(ctx, domain)
	return nil
}
