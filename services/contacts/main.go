package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
	"github.com/haseen-me/haseen-apps/services/contacts/internal/handler"
	"github.com/haseen-me/haseen-apps/services/contacts/internal/middleware"
	"github.com/haseen-me/haseen-apps/services/contacts/internal/store"
	"github.com/rs/zerolog"
)

func main() {
log := zerolog.New(os.Stdout).With().Timestamp().Str("service", "contacts").Logger()

port := os.Getenv("PORT")
if port == "" {
port = "4008"
}
dbURL := os.Getenv("DATABASE_URL")
if dbURL == "" {
dbURL = "postgres://haseen:haseen@localhost:5432/haseen?sslmode=disable"
}
devMode := os.Getenv("DEV_MODE") == "true"

ctx := context.Background()
st, err := store.New(ctx, dbURL)
if err != nil {
log.Fatal().Err(err).Msg("failed to connect to database")
}
defer st.Close()

h := &handler.Handler{Store: st, Log: log}

r := chi.NewRouter()
r.Use(chimw.RequestID)
r.Use(chimw.RealIP)
r.Use(chimw.Recoverer)

r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
w.Header().Set("Content-Type", "application/json")
fmt.Fprint(w, `{"status":"ok","service":"contacts"}`)
})

r.Route("/v1", func(r chi.Router) {
if devMode {
r.Use(middleware.DevAuth())
} else {
r.Use(middleware.Auth(st.DB))
}

r.Get("/contacts", h.ListContacts)
r.Post("/contacts", h.CreateContact)
r.Get("/contacts/{contactID}", h.GetContact)
r.Put("/contacts/{contactID}", h.UpdateContact)
r.Delete("/contacts/{contactID}", h.DeleteContact)
r.Post("/contacts/search", h.SearchContacts)
		r.Get("/groups", h.ListGroups)
		r.Post("/groups", h.CreateGroup)
		r.Put("/groups/{groupID}", h.UpdateGroup)
		r.Delete("/groups/{groupID}", h.DeleteGroup)
		r.Post("/groups/{groupID}/members", h.AddToGroup)
		r.Delete("/groups/{groupID}/members/{contactID}", h.RemoveFromGroup)
		r.Get("/groups/{groupID}/members", h.GetGroupMembers)})

srv := &http.Server{Addr: ":" + port, Handler: r}
go func() {
log.Info().Str("port", port).Bool("dev", devMode).Msg("contacts server started")
if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
log.Fatal().Err(err).Msg("server error")
}
}()

quit := make(chan os.Signal, 1)
signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
<-quit
log.Info().Msg("shutting down")

shutCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
defer cancel()
srv.Shutdown(shutCtx)
}
