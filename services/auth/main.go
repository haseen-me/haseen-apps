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
	"github.com/haseen-me/haseen-apps/services/auth/internal/handler"
	"github.com/haseen-me/haseen-apps/services/auth/internal/middleware"
	"github.com/haseen-me/haseen-apps/services/auth/internal/store"
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
		w.Write([]byte(`{"status":"ok","service":"auth"}`))
	})

	// Select auth middleware
	var authMW func(http.Handler) http.Handler
	if devMode {
		log.Warn().Msg("running in DEV mode — using X-User-ID header auth")
		authMW = middleware.DevAuth()
	} else {
		authMW = middleware.Auth(db.DB)
	}

	r.Route("/v1", func(r chi.Router) {
		// Public routes (no auth required)
		r.Post("/register", h.Register)
		r.Post("/login/init", h.LoginInit)
		r.Post("/login/verify", h.LoginVerify)
		r.Post("/mfa/verify-login", h.MFAVerifyLogin)
		r.Post("/logout", h.Logout)
		r.Post("/session/refresh", h.SessionRefresh)

		// Public key lookup (no auth)
		r.Get("/keys/{userID}", h.GetKeys)

		// Authenticated routes
		r.Group(func(r chi.Router) {
			r.Use(authMW)

			r.Delete("/session", h.SessionDelete)
			r.Get("/sessions", h.ListSessions)
			r.Delete("/sessions/{sessionID}", h.RevokeSession)
			r.Post("/keys/upload", h.UploadKeys)

			// MFA management
			r.Post("/mfa/setup", h.MFASetup)
			r.Post("/mfa/verify", h.MFAVerifySetup)
			r.Delete("/mfa", h.MFADisable)

			// Account
			r.Get("/account", h.GetAccount)
			r.Put("/account", h.UpdateAccount)
			r.Delete("/account", h.DeleteAccount)
			r.Put("/account/password", h.ChangePassword)
			r.Post("/account/recovery-key", h.GenerateRecoveryKey)
		})
	})

	// Start periodic session cleanup
	go func() {
		ticker := time.NewTicker(1 * time.Hour)
		defer ticker.Stop()
		for range ticker.C {
			n, err := db.CleanExpiredSessions(context.Background())
			if err != nil {
				log.Error().Err(err).Msg("session cleanup failed")
			} else if n > 0 {
				log.Info().Int64("deleted", n).Msg("cleaned expired sessions")
			}
		}
	}()

	log.Info().Str("port", port).Bool("devMode", devMode).Msg("auth service started")

	srv := &http.Server{Addr: ":" + port, Handler: r}
	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal().Err(err).Msg("auth service failed")
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Info().Msg("shutting down auth service...")

	shutCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	srv.Shutdown(shutCtx)
}
