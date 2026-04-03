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

	port := os.Getenv("AUTH_PORT")
	if port == "" {
		port = "8081"
	}

	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.Recoverer)

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprint(w, `{"status":"ok","service":"auth"}`)
	})

	r.Route("/v1", func(r chi.Router) {
		r.Post("/register", notImplemented)
		r.Post("/login/init", notImplemented)
		r.Post("/login/verify", notImplemented)
		r.Post("/logout", notImplemented)
		r.Post("/session/refresh", notImplemented)
		r.Delete("/session", notImplemented)
		r.Post("/keys/upload", notImplemented)
		r.Get("/keys/{userID}", notImplemented)
		r.Post("/mfa/setup", notImplemented)
		r.Post("/mfa/verify", notImplemented)
		r.Delete("/mfa", notImplemented)
		r.Get("/account", notImplemented)
		r.Put("/account", notImplemented)
		r.Delete("/account", notImplemented)
		r.Post("/account/recovery-key", notImplemented)
	})

	log.Info().Str("port", port).Msg("auth service started")
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatal().Err(err).Msg("auth service failed")
	}
}

func notImplemented(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusNotImplemented)
	fmt.Fprint(w, `{"error":"not implemented"}`)
}
