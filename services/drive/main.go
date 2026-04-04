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

	"github.com/haseen-me/haseen-apps/services/drive/internal/blob"
	"github.com/haseen-me/haseen-apps/services/drive/internal/handler"
	"github.com/haseen-me/haseen-apps/services/drive/internal/middleware"
	"github.com/haseen-me/haseen-apps/services/drive/internal/store"
)

func main() {
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})

	port := envOr("DRIVE_PORT", "8083")
	dbURL := envOr("DATABASE_URL", "postgres://haseen:haseen@localhost:5432/haseen?sslmode=disable")
	blobDir := envOr("BLOB_DIR", "./data/blobs")
	devMode := envOr("DEV_MODE", "false") == "true"

	ctx := context.Background()

	st, err := store.New(ctx, dbURL)
	if err != nil {
		log.Fatal().Err(err).Msg("database connection failed")
	}
	defer st.Close()

	blobStore, err := blob.NewStorage(blobDir)
	if err != nil {
		log.Fatal().Err(err).Msg("blob storage init failed")
	}

	h := &handler.Handler{
		Store: st,
		Blob:  blobStore,
		Log:   log.Logger,
	}

	r := chi.NewRouter()
	r.Use(chimw.RequestID)
	r.Use(chimw.RealIP)
	r.Use(chimw.Recoverer)

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprint(w, `{"status":"ok","service":"drive"}`)
	})

	r.Route("/v1", func(r chi.Router) {
		if devMode {
			r.Use(middleware.DevAuth())
		} else {
			r.Use(middleware.Auth(st.DB))
		}

		r.Get("/files", h.ListFiles)
		r.Get("/files/{fileID}", h.GetFile)
		r.Post("/files/upload", h.UploadFile)
		r.Put("/files/{fileID}", h.UpdateFile)
		r.Delete("/files/{fileID}", h.DeleteFile)
		r.Post("/files/{fileID}/move", h.MoveFile)
		r.Post("/files/{fileID}/share", h.ShareFile)
		r.Get("/files/{fileID}/download", h.DownloadFile)

		r.Get("/folders/{folderID}", h.GetFolder)
		r.Post("/folders", h.CreateFolder)
		r.Delete("/folders/{folderID}", h.DeleteFolder)

		r.Post("/search", h.Search)

		r.Get("/trash", h.ListTrash)
		r.Post("/trash/{fileID}/restore", h.RestoreFile)
		r.Delete("/trash", h.EmptyTrash)
		r.Get("/shared", h.SharedWithMe)
	})

	go func() {
		log.Info().Str("port", port).Bool("dev", devMode).Msg("drive service started")
		if err := http.ListenAndServe(":"+port, r); err != nil {
			log.Fatal().Err(err).Msg("server failed")
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Info().Msg("shutting down drive service")
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
