package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
	"github.com/haseen-me/haseen-apps/services/keyserver/internal/handler"
	"github.com/haseen-me/haseen-apps/services/keyserver/internal/middleware"
	"github.com/haseen-me/haseen-apps/services/keyserver/internal/store"
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
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://haseen:haseen@localhost:5432/haseen?sslmode=disable"
	}
	devMode := os.Getenv("DEV_MODE") == "true"

	ctx := context.Background()
	db, err := store.New(ctx, dbURL)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to connect to database")
	}
	defer db.Close()

	h := &handler.Handler{
		Store: db,
		Log:   log.Logger,
	}

	r := chi.NewRouter()
	r.Use(chimw.RequestID)
	r.Use(chimw.RealIP)
	r.Use(chimw.Recoverer)

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok","service":"keyserver"}`))
	})

	var authMW func(http.Handler) http.Handler
	if devMode {
		log.Warn().Msg("running in DEV mode")
		authMW = middleware.DevAuth()
	} else {
		authMW = middleware.Auth(db.DB)
	}

	r.Route("/v1", func(r chi.Router) {
		// Public key directory (no auth)
		r.Get("/keys/{userID}", h.GetKeys)
		r.Get("/keys/{userID}/signing", h.GetSigningKey)
		r.Post("/keys/lookup", h.Lookup)

		// Pre-key exchange (no auth for fetching)
		r.Get("/prekeys/{userID}", h.GetPreKey)

		// Authenticated routes
		r.Group(func(r chi.Router) {
			r.Use(authMW)
			r.Post("/keys/publish", h.Publish)
			r.Post("/keys/rotate", h.Rotate)
			r.Post("/keys/revoke", h.Revoke)
			r.Post("/prekeys/upload", h.UploadPreKeys)
		})
	})

	log.Info().Str("port", port).Bool("devMode", devMode).Msg("keyserver started")

	srv := &http.Server{Addr: ":" + port, Handler: r}
	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal().Err(err).Msg("keyserver failed")
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Info().Msg("shutting down keyserver...")

	shutCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	srv.Shutdown(shutCtx)
}
