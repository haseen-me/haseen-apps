package config

import (
	"os"
	"strings"
)

// Auth holds runtime configuration for the identity service.
type Auth struct {
	Port              string
	DatabaseURL       string
	DevMode           bool
	SessionCookieName string
	CookieSecure      bool
	WebAuthnRPID      string
	WebAuthnOrigins   []string
	WebAuthnDisplay   string
	AppBaseURL        string
}

func Load() Auth {
	port := os.Getenv("AUTH_PORT")
	if port == "" {
		port = "8081"
	}
	db := os.Getenv("DATABASE_URL")
	if db == "" {
		db = "postgres://haseen:haseen@localhost:5432/haseen?sslmode=disable"
	}
	dev := os.Getenv("DEV_MODE") == "true"
	cookieName := os.Getenv("SESSION_COOKIE_NAME")
	if cookieName == "" {
		cookieName = "haseen_session"
	}
	secure := os.Getenv("SESSION_COOKIE_SECURE") != "false"
	rpID := os.Getenv("WEBAUTHN_RP_ID")
	if rpID == "" {
		rpID = "localhost"
	}
	originsStr := os.Getenv("WEBAUTHN_ORIGINS")
	if originsStr == "" {
		originsStr = "http://localhost:3003,http://localhost:3001,http://localhost:3000"
	}
	var origins []string
	for _, o := range strings.Split(originsStr, ",") {
		o = strings.TrimSpace(o)
		if o != "" {
			origins = append(origins, o)
		}
	}
	display := os.Getenv("WEBAUTHN_DISPLAY_NAME")
	if display == "" {
		display = "Haseen"
	}
	base := os.Getenv("APP_BASE_URL")
	if base == "" {
		base = "http://localhost:3000"
	}
	return Auth{
		Port:              port,
		DatabaseURL:       db,
		DevMode:           dev,
		SessionCookieName: cookieName,
		CookieSecure:      secure,
		WebAuthnRPID:      rpID,
		WebAuthnOrigins:   origins,
		WebAuthnDisplay:   display,
		AppBaseURL:        strings.TrimRight(base, "/"),
	}
}
