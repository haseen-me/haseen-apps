package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-webauthn/webauthn/protocol"
	"github.com/go-webauthn/webauthn/webauthn"
	"github.com/haseen-me/haseen-apps/services/auth/internal/config"
	"github.com/haseen-me/haseen-apps/services/auth/internal/httpapi"
	"github.com/haseen-me/haseen-apps/services/auth/internal/store"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func main() {
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})

	cfg := config.Load()

	ctx := context.Background()
	db, err := store.New(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to connect to database")
	}
	defer db.Close()

	var wa *webauthn.WebAuthn
	wcfg := &webauthn.Config{
		RPDisplayName:         cfg.WebAuthnDisplay,
		RPID:                  cfg.WebAuthnRPID,
		RPOrigins:             cfg.WebAuthnOrigins,
		AttestationPreference: protocol.PreferNoAttestation,
	}
	if w, err := webauthn.New(wcfg); err != nil {
		log.Warn().Err(err).Msg("WebAuthn disabled — check WEBAUTHN_RP_ID and WEBAUTHN_ORIGINS")
	} else {
		wa = w
	}

	srv := &httpapi.Server{
		Store:   db,
		Log:     log.Logger,
		Cfg:     cfg,
		WebAuth: wa,
	}
	app := httpapi.NewFiberApp(srv)

	go func() {
		ticker := time.NewTicker(time.Hour)
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

	go func() {
		addr := ":" + cfg.Port
		log.Info().Str("addr", addr).Bool("devMode", cfg.DevMode).Msg("auth service listening")
		if err := app.Listen(addr); err != nil {
			log.Fatal().Err(err).Msg("auth service failed")
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Info().Msg("shutting down auth service...")
	_ = app.Shutdown()
}
