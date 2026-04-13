package main

import (
	"context"
	"encoding/hex"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"

	"github.com/haseen-me/haseen-apps/services/mail/internal/dkim"
	"github.com/haseen-me/haseen-apps/services/mail/internal/events"
	"github.com/haseen-me/haseen-apps/services/mail/internal/handler"
	"github.com/haseen-me/haseen-apps/services/mail/internal/middleware"
	smtppkg "github.com/haseen-me/haseen-apps/services/mail/internal/smtp"
	"github.com/haseen-me/haseen-apps/services/mail/internal/store"
	"github.com/haseen-me/haseen-apps/services/mail/internal/worker"
)

func main() {
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})

	port := env("MAIL_PORT", "8082")
	smtpPort := env("SMTP_PORT", "2525")
	domain := env("MAIL_DOMAIN", "haseen.me")
	dbURL := env("DATABASE_URL", "postgres://haseen:haseen@localhost:5432/haseen?sslmode=disable")
	devMode := env("DEV_MODE", "false") == "true"
	dkimKeyHex := env("DKIM_ENCRYPTION_KEY", "0000000000000000000000000000000000000000000000000000000000000000")

	dkimKeyBytes, err := hex.DecodeString(dkimKeyHex)
	if err != nil || len(dkimKeyBytes) != 32 {
		log.Warn().Msg("DKIM_ENCRYPTION_KEY invalid or not set, using zero key (development only)")
		dkimKeyBytes = make([]byte, 32)
	}
	dkim.SetEncryptionKey(dkimKeyBytes)

	// Database
	ctx := context.Background()
	st, err := store.New(ctx, dbURL)
	if err != nil {
		log.Fatal().Err(err).Msg("database connection failed")
	}
	defer st.Close()

	// SMTP Sender (for outbound relay)
	sender := smtppkg.NewSender(domain, log.Logger)

	// DNS verification worker
	dnsWorker := worker.NewDNSWorker(st, log.Logger, domain, 60*time.Second)
	dnsWorker.Start()
	defer dnsWorker.Stop()

	// Outbound relay worker
	relayWorker := worker.NewRelayWorker(st, sender, log.Logger, 5*time.Second)
	relayWorker.Start()
	defer relayWorker.Stop()

	// Handler
	broker := events.NewBroker()
	h := &handler.Handler{
		Store:     st,
		Log:       log.Logger,
		Domain:    domain,
		DNSWorker: dnsWorker,
		Broker:    broker,
	}

	// Router
	r := chi.NewRouter()
	r.Use(chimw.RequestID)
	r.Use(chimw.RealIP)
	r.Use(chimw.Recoverer)

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprint(w, `{"status":"ok","service":"mail"}`)
	})

	r.Route("/v1", func(r chi.Router) {
		if devMode {
			r.Use(middleware.DevAuth())
		} else {
			r.Use(middleware.Auth(st.DB))
		}

		// Mailbox
		r.Get("/mailbox", h.GetMailbox)
		r.Get("/mailbox/{label}", h.GetMailboxByLabel)

		// Messages
		r.Get("/messages/{messageID}", h.GetMessage)
		r.Post("/messages/send", h.SendMessage)
		r.Put("/messages/{messageID}", h.UpdateMessage)
		r.Delete("/messages/{messageID}", h.DeleteMessage)
		r.Post("/messages/{messageID}/move", h.MoveMessage)

		// Threads
		r.Get("/threads/{threadID}", h.GetThread)

		// Labels
		r.Get("/labels", h.ListLabels)
		r.Post("/labels", h.CreateLabel)
		r.Put("/labels/{labelID}", h.UpdateLabel)
		r.Delete("/labels/{labelID}", h.DeleteLabel)

		// Attachments
		r.Get("/attachments/{attachmentID}", h.GetAttachment)
		r.Post("/messages/{messageID}/attachments", h.UploadAttachment)

		// Search
		r.Post("/search", h.Search)

		// Realtime
		r.Get("/events", h.StreamEvents)

		// Drafts
		r.Post("/drafts", h.SaveDraft)
		r.Put("/drafts/{messageID}", h.UpdateDraft)
		r.Post("/drafts/{messageID}/send", h.SendDraft)

		// Custom Domains
		r.Get("/domains", h.ListDomains)
		r.Post("/domains", h.AddDomain)
		r.Get("/domains/{domainID}", h.GetDomain)
		r.Delete("/domains/{domainID}", h.DeleteDomain)
		r.Post("/domains/{domainID}/verify", h.VerifyDomain)
		r.Get("/domains/{domainID}/dns", h.GetDNSRecords)
		r.Get("/domains/{domainID}/dns/logs", h.GetDNSCheckLogs)

		// Domain Mailboxes
		r.Get("/domains/{domainID}/mailboxes", h.ListDomainMailboxes)
		r.Post("/domains/{domainID}/mailboxes", h.AddDomainMailbox)
		r.Delete("/domains/{domainID}/mailboxes/{mailboxID}", h.DeleteDomainMailbox)
	})

	// SMTP Server (inbound)
	smtpSrv := smtppkg.NewServer(":"+smtpPort, domain, st, log.Logger, nil, broker)
	if err := smtpSrv.Start(); err != nil {
		log.Fatal().Err(err).Msg("SMTP server failed to start")
	}
	defer smtpSrv.Stop()

	// HTTP Server
	go func() {
		log.Info().Str("port", port).Bool("dev", devMode).Msg("mail HTTP server started")
		if err := http.ListenAndServe(":"+port, r); err != nil {
			log.Fatal().Err(err).Msg("HTTP server failed")
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Info().Msg("shutting down mail service")
}

func env(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
