package main

import (
	"fmt"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func main() {
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})

	port := os.Getenv("MAIL_PORT")
	if port == "" {
		port = "8082"
	}

	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.Recoverer)

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprint(w, `{"status":"ok","service":"mail"}`)
	})

	r.Route("/v1", func(r chi.Router) {
		r.Get("/mailbox", notImplemented)
		r.Get("/mailbox/{label}", notImplemented)
		r.Get("/messages/{messageID}", notImplemented)
		r.Post("/messages/send", notImplemented)
		r.Put("/messages/{messageID}", notImplemented)
		r.Delete("/messages/{messageID}", notImplemented)
		r.Post("/messages/{messageID}/move", notImplemented)
		r.Get("/threads/{threadID}", notImplemented)
		r.Post("/labels", notImplemented)
		r.Put("/labels/{labelID}", notImplemented)
		r.Delete("/labels/{labelID}", notImplemented)
		r.Get("/attachments/{attachmentID}", notImplemented)
		r.Post("/search", notImplemented)
	})

	log.Info().Str("port", port).Msg("mail service started")
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatal().Err(err).Msg("mail service failed")
	}
}

func notImplemented(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusNotImplemented)
	fmt.Fprint(w, `{"error":"not implemented"}`)
}
