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

	port := os.Getenv("KEYSERVER_PORT")
	if port == "" {
		port = "8084"
	}

	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.Recoverer)

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprint(w, `{"status":"ok","service":"keyserver"}`)
	})

	r.Route("/v1", func(r chi.Router) {
		// Public key directory
		r.Get("/keys/{userID}", notImplemented)
		r.Get("/keys/{userID}/signing", notImplemented)
		r.Post("/keys/lookup", notImplemented)

		// Key exchange (authenticated)
		r.Post("/keys/publish", notImplemented)
		r.Post("/keys/rotate", notImplemented)
		r.Post("/keys/revoke", notImplemented)

		// Signed pre-keys for async E2E
		r.Get("/prekeys/{userID}", notImplemented)
		r.Post("/prekeys/upload", notImplemented)
	})

	log.Info().Str("port", port).Msg("keyserver started")
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatal().Err(err).Msg("keyserver failed")
	}
}

func notImplemented(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusNotImplemented)
	fmt.Fprint(w, `{"error":"not implemented"}`)
}
