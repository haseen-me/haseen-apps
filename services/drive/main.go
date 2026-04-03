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

	port := os.Getenv("DRIVE_PORT")
	if port == "" {
		port = "8083"
	}

	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.Recoverer)

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprint(w, `{"status":"ok","service":"drive"}`)
	})

	r.Route("/v1", func(r chi.Router) {
		r.Get("/files", notImplemented)
		r.Get("/files/{fileID}", notImplemented)
		r.Post("/files/upload", notImplemented)
		r.Put("/files/{fileID}", notImplemented)
		r.Delete("/files/{fileID}", notImplemented)
		r.Post("/files/{fileID}/move", notImplemented)
		r.Post("/files/{fileID}/share", notImplemented)
		r.Get("/folders/{folderID}", notImplemented)
		r.Post("/folders", notImplemented)
		r.Delete("/folders/{folderID}", notImplemented)
		r.Get("/files/{fileID}/download", notImplemented)
		r.Post("/search", notImplemented)
	})

	log.Info().Str("port", port).Msg("drive service started")
	if err := http.ListenAndServe(":"+port, r); err != nil {
		log.Fatal().Err(err).Msg("drive service failed")
	}
}

func notImplemented(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusNotImplemented)
	fmt.Fprint(w, `{"error":"not implemented"}`)
}
