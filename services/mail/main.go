package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"

	"github.com/haseen-me/haseen-apps/services/mail/internal/handler"
	"github.com/haseen-me/haseen-apps/services/mail/internal/middleware"
	smtppkg "github.com/haseen-me/haseen-apps/services/mail/internal/smtp"
	"github.com/haseen-me/haseen-apps/services/mail/internal/store"
)

func main() {
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})

	port := env("MAIL_PORT", "8082")
	smtpPort := env("SMTP_PORT", "2525")
	domain := env("MAIL_DOMAIN", "haseen.me")
	dbURL := env("DATABASE_URL", "postgres://haseen:haseen@localhost:5432/haseen?sslmode=disable")
	devMode := env("DEV_MODE", "false") == "true"

	// Database
	ctx := context.Background()
	st, err := store.New(ctx, dbURL)
	if err != nil {
		log.Fatal().Err(err).Msg("database connection failed")
	}
	defer st.Close()

	// Handler
	h := &handler.Handler{
		Store:  st,
		Log:    log.Logger,
		Domain: domain,
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
		r.Post("/labels", h.CreateLabel)
		r.Put("/labels/{labelID}", h.UpdateLabel)
		r.Delete("/labels/{labelID}", h.DeleteLabel)

		// Attachments
		r.Get("/attachments/{attachmentID}", h.GetAttachment)

		// Search
		r.Post("/search", h.Search)
	})

	// SMTP Server (inbound)
	smtpSrv := smtppkg.NewServer(":"+smtpPort, domain, st, log.Logger, nil)
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
