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

	"github.com/haseen-me/haseen-apps/services/calendar/internal/handler"
	"github.com/haseen-me/haseen-apps/services/calendar/internal/middleware"
	"github.com/haseen-me/haseen-apps/services/calendar/internal/store"
)

func main() {
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})

	port := envOr("CALENDAR_PORT", "8085")
	dbURL := envOr("DATABASE_URL", "postgres://haseen:haseen@localhost:5432/haseen?sslmode=disable")
	devMode := envOr("DEV_MODE", "false") == "true"

	ctx := context.Background()

	st, err := store.New(ctx, dbURL)
	if err != nil {
		log.Fatal().Err(err).Msg("database connection failed")
	}
	defer st.Close()

	h := &handler.Handler{
		Store: st,
		Log:   log.Logger,
	}

	r := chi.NewRouter()
	r.Use(chimw.RequestID)
	r.Use(chimw.RealIP)
	r.Use(chimw.Recoverer)

	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprint(w, `{"status":"ok","service":"calendar"}`)
	})

	r.Route("/v1", func(r chi.Router) {
		if devMode {
			r.Use(middleware.DevAuth())
		} else {
			r.Use(middleware.Auth(st.DB))
		}

		// Calendars
		r.Get("/calendars", h.ListCalendars)
		r.Post("/calendars", h.CreateCalendar)
		r.Put("/calendars/{calendarID}", h.UpdateCalendar)
		r.Delete("/calendars/{calendarID}", h.DeleteCalendar)

		// Events
		r.Get("/events", h.ListEvents)
		r.Post("/events", h.CreateEvent)
		r.Get("/events/{eventID}", h.GetEvent)
		r.Put("/events/{eventID}", h.UpdateEvent)
		r.Delete("/events/{eventID}", h.DeleteEvent)

		// Attendees
		r.Get("/events/{eventID}/attendees", h.ListAttendees)
		r.Post("/events/{eventID}/attendees", h.AddAttendee)
		r.Delete("/events/{eventID}/attendees/{attendeeID}", h.RemoveAttendee)

		// Reminders
		r.Get("/events/{eventID}/reminders", h.ListReminders)
		r.Post("/events/{eventID}/reminders", h.SetReminder)
		r.Delete("/events/{eventID}/reminders/{reminderID}", h.DeleteReminder)
	})

	go func() {
		log.Info().Str("port", port).Bool("dev", devMode).Msg("calendar service started")
		if err := http.ListenAndServe(":"+port, r); err != nil {
			log.Fatal().Err(err).Msg("server failed")
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Info().Msg("shutting down calendar service")
}

func envOr(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
