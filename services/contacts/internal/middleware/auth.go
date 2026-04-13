package middleware

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type contextKey string

const ctxKeyUserID contextKey = "userID"

const sessionCookieName = "haseen_session"

func extractSessionToken(r *http.Request) string {
	if c, err := r.Cookie(sessionCookieName); err == nil && c.Value != "" {
		return c.Value
	}
	return extractBearer(r)
}

func Auth(db *pgxpool.Pool) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			token := extractSessionToken(r)
			if token == "" {
				httpErr(w, http.StatusUnauthorized, "missing authorization")
				return
			}
			userID, err := lookupSession(r.Context(), db, token)
			if err != nil {
				httpErr(w, http.StatusUnauthorized, "invalid session")
				return
			}
			ctx := context.WithValue(r.Context(), ctxKeyUserID, userID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func DevAuth() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			uid := r.Header.Get("X-User-ID")
			if uid == "" {
				uid = extractSessionToken(r)
			}
			if uid == "" {
				httpErr(w, http.StatusUnauthorized, "set X-User-ID header")
				return
			}
			ctx := context.WithValue(r.Context(), ctxKeyUserID, uid)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func extractBearer(r *http.Request) string {
	h := r.Header.Get("Authorization")
	if !strings.HasPrefix(h, "Bearer ") {
		return ""
	}
	return strings.TrimPrefix(h, "Bearer ")
}

func lookupSession(ctx context.Context, db *pgxpool.Pool, token string) (string, error) {
	var uid string
	err := db.QueryRow(ctx,
		`SELECT user_id FROM sessions
		 WHERE token_hash = encode(digest($1, 'sha256'), 'hex')
		   AND expires_at > $2`,
		token, time.Now(),
	).Scan(&uid)
	return uid, err
}

func httpErr(w http.ResponseWriter, code int, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	w.Write([]byte(`{"error":"` + msg + `"}`))
}
