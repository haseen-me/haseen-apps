package main

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"os/signal"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"golang.org/x/time/rate"
)

func main() {
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})

	port := env("GATEWAY_PORT", "8080")
	authURL := env("AUTH_URL", "http://localhost:8081")
	mailURL := env("MAIL_URL", "http://localhost:8082")
	driveURL := env("DRIVE_URL", "http://localhost:8083")
	keysURL := env("KEYSERVER_URL", "http://localhost:8084")
	calendarURL := env("CALENDAR_URL", "http://localhost:8085")
	contactsURL := env("CONTACTS_URL", "http://localhost:4008")

	r := chi.NewRouter()

	r.Use(chimw.RequestID)
	r.Use(chimw.RealIP)
	r.Use(chimw.Recoverer)
	r.Use(chimw.Compress(5))
	r.Use(requestLogger)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:*", "https://*.haseen.me"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-Request-ID", "X-User-ID"},
		ExposedHeaders:   []string{"X-Request-ID"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Rate limiter: 60 req/s per IP
	rl := newIPRateLimiter(rate.Limit(60), 120)
	r.Use(rateLimitMiddleware(rl))

	// Health check — aggregates all service statuses
	r.Get("/api/health", healthHandler(authURL, mailURL, driveURL, keysURL, calendarURL, contactsURL))

	// Reverse proxy routes
	r.Route("/api/v1/auth", proxyRoute(authURL, "/v1"))
	r.Route("/api/v1/mail", proxyRoute(mailURL, "/v1"))
	r.Route("/api/v1/drive", proxyRoute(driveURL, "/v1"))
	r.Route("/api/v1/keys", proxyRoute(keysURL, "/v1"))
	r.Route("/api/v1/calendar", proxyRoute(calendarURL, "/v1"))
	r.Route("/api/v1/contacts", proxyRoute(contactsURL, "/v1"))

	log.Info().
		Str("port", port).
		Str("auth", authURL).
		Str("mail", mailURL).
		Str("drive", driveURL).
		Str("keys", keysURL).
		Str("calendar", calendarURL).
		Str("contacts", contactsURL).
		Msg("gateway started")

	srv := &http.Server{
		Addr:         ":" + port,
		Handler:      r,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 60 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal().Err(err).Msg("gateway failed")
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Info().Msg("shutting down gateway...")

	shutCtx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
	defer cancel()
	srv.Shutdown(shutCtx)
}

// --- Reverse Proxy ---

func proxyRoute(target, stripPrefix string) func(chi.Router) {
	u, err := url.Parse(target)
	if err != nil {
		log.Fatal().Err(err).Str("target", target).Msg("invalid proxy target")
	}

	proxy := httputil.NewSingleHostReverseProxy(u)
	proxy.ErrorHandler = func(w http.ResponseWriter, r *http.Request, err error) {
		log.Error().Err(err).Str("target", target).Str("path", r.URL.Path).Msg("proxy error")
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadGateway)
		fmt.Fprint(w, `{"error":"service unavailable"}`)
	}

	return func(r chi.Router) {
		r.HandleFunc("/*", func(w http.ResponseWriter, r *http.Request) {
			// Rewrite path: /api/v1/auth/register → /v1/register
			rctx := chi.RouteContext(r.Context())
			pathSuffix := rctx.RoutePath
			if idx := strings.Index(pathSuffix, "/*"); idx >= 0 {
				pathSuffix = pathSuffix[idx+2:]
			}
			r.URL.Path = stripPrefix + pathSuffix
			r.URL.RawPath = ""
			r.Host = u.Host
			proxy.ServeHTTP(w, r)
		})
	}
}

// --- Health Aggregation ---

func healthHandler(authURL, mailURL, driveURL, keysURL, calendarURL, contactsURL string) http.HandlerFunc {
	services := map[string]string{
		"auth":      authURL + "/health",
		"mail":      mailURL + "/health",
		"drive":     driveURL + "/health",
		"keyserver": keysURL + "/health",
		"calendar":  calendarURL + "/health",
		"contacts":  contactsURL + "/health",
	}

	return func(w http.ResponseWriter, r *http.Request) {
		client := &http.Client{Timeout: 3 * time.Second}
		results := make(map[string]string, len(services))
		allOK := true

		for name, url := range services {
			resp, err := client.Get(url)
			if err != nil || resp.StatusCode != http.StatusOK {
				results[name] = "down"
				allOK = false
			} else {
				results[name] = "ok"
			}
			if resp != nil {
				resp.Body.Close()
			}
		}

		status := http.StatusOK
		overall := "ok"
		if !allOK {
			status = http.StatusServiceUnavailable
			overall = "degraded"
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(status)
		fmt.Fprintf(w, `{"status":"%s","services":{"auth":"%s","mail":"%s","drive":"%s","keyserver":"%s","calendar":"%s"}}`,
			overall, results["auth"], results["mail"], results["drive"], results["keyserver"], results["calendar"])
	}
}

// --- IP Rate Limiter ---

type ipRateLimiter struct {
	mu       sync.Mutex
	limiters map[string]*limiterEntry
	rate     rate.Limit
	burst    int
}

type limiterEntry struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

func newIPRateLimiter(r rate.Limit, burst int) *ipRateLimiter {
	rl := &ipRateLimiter{
		limiters: make(map[string]*limiterEntry),
		rate:     r,
		burst:    burst,
	}
	go rl.cleanup(5 * time.Minute)
	return rl
}

func (i *ipRateLimiter) getLimiter(ip string) *rate.Limiter {
	i.mu.Lock()
	defer i.mu.Unlock()

	entry, exists := i.limiters[ip]
	if !exists {
		entry = &limiterEntry{
			limiter:  rate.NewLimiter(i.rate, i.burst),
			lastSeen: time.Now(),
		}
		i.limiters[ip] = entry
	} else {
		entry.lastSeen = time.Now()
	}
	return entry.limiter
}

func (i *ipRateLimiter) cleanup(interval time.Duration) {
	for {
		time.Sleep(interval)
		i.mu.Lock()
		for ip, entry := range i.limiters {
			if time.Since(entry.lastSeen) > 10*time.Minute {
				delete(i.limiters, ip)
			}
		}
		i.mu.Unlock()
	}
}

func rateLimitMiddleware(rl *ipRateLimiter) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ip := r.RemoteAddr
			if fwd := r.Header.Get("X-Forwarded-For"); fwd != "" {
				ip = strings.Split(fwd, ",")[0]
			}
			ip = strings.TrimSpace(ip)

			limiter := rl.getLimiter(ip)
			if !limiter.Allow() {
				w.Header().Set("Content-Type", "application/json")
				w.Header().Set("Retry-After", "1")
				w.WriteHeader(http.StatusTooManyRequests)
				fmt.Fprint(w, `{"error":"rate limit exceeded"}`)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

// --- Request Logger ---

func requestLogger(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		ww := chimw.NewWrapResponseWriter(w, r.ProtoMajor)
		next.ServeHTTP(ww, r)

		log.Info().
			Str("method", r.Method).
			Str("path", r.URL.Path).
			Int("status", ww.Status()).
			Int("bytes", ww.BytesWritten()).
			Dur("latency", time.Since(start)).
			Str("ip", r.RemoteAddr).
			Msg("request")
	})
}

func env(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
