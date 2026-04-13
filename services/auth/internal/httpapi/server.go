package httpapi

import (
	"bytes"
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"io"
	"net/http"
	"strings"
	"time"

	"github.com/go-webauthn/webauthn/webauthn"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/fiber/v2/middleware/requestid"
	"github.com/haseen-me/haseen-apps/services/auth/internal/config"
	"github.com/haseen-me/haseen-apps/services/auth/internal/crypto"
	"github.com/haseen-me/haseen-apps/services/auth/internal/model"
	"github.com/haseen-me/haseen-apps/services/auth/internal/store"
	"github.com/haseen-me/haseen-apps/services/auth/internal/totp"
	"github.com/haseen-me/haseen-apps/services/auth/internal/webuser"
	"github.com/rs/zerolog"
)

const (
	sessionDataKey = "webauthn_session"
	localUserID    = "userID"
	localSuper     = "isSuperAdmin"
	allowedDomain  = "haseen.me"
)

// Server wires HTTP routes to the identity store.
type Server struct {
	Store   store.DataStore
	Log     zerolog.Logger
	Cfg     config.Auth
	WebAuth *webauthn.WebAuthn
}

func NewFiberApp(s *Server) *fiber.App {
	app := fiber.New(fiber.Config{
		DisableStartupMessage: true,
		ErrorHandler:          errorHandler,
	})

	app.Use(recover.New())
	app.Use(requestid.New())

	app.Use(cors.New(cors.Config{
		AllowOriginsFunc: func(origin string) bool {
			for _, o := range s.Cfg.WebAuthnOrigins {
				if o == origin {
					return true
				}
			}
			return false
		},
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders:     "Accept,Authorization,Content-Type,X-Request-ID,X-User-ID",
		AllowCredentials: true,
		MaxAge:           300,
	}))

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok", "service": "auth"})
	})

	v1 := app.Group("/v1")

	// Public
	v1.Post("/register", s.handleRegister)
	v1.Post("/login", s.handleLogin)
	v1.Post("/login/mfa", s.handleLoginMFA)
	v1.Post("/logout", s.handleLogout)
	v1.Post("/session/refresh", s.handleSessionRefresh)
	v1.Get("/verify-email", s.handleVerifyEmail)
	v1.Post("/password/forgot", s.handleForgotPassword)
	v1.Post("/password/reset", s.handleResetPassword)

	// WebAuthn
	v1.Post("/webauthn/register/begin", s.handleWABeginRegister)
	v1.Post("/webauthn/register/finish", s.handleWAFinishRegister)
	v1.Post("/webauthn/login/begin", s.handleWABeginLogin)
	v1.Post("/webauthn/login/finish", s.handleWAFinishLogin)

	auth := v1.Group("", s.authMiddleware)

	auth.Delete("/session", s.handleSessionDeleteAll)
	auth.Get("/sessions", s.handleListSessions)
	auth.Delete("/sessions/:sessionID", s.handleRevokeSession)
	auth.Get("/me", s.handleMe)
	auth.Get("/account", s.handleGetAccount)
	auth.Put("/account", s.handleUpdateAccount)
	auth.Delete("/account", s.handleDeleteAccount)
	auth.Put("/account/password", s.handleChangePassword)
	auth.Post("/account/recovery-key", s.handleRecoveryKey)
	auth.Post("/mfa/setup", s.handleMFASetup)
	auth.Post("/mfa/verify", s.handleMFAVerifySetup)
	auth.Delete("/mfa", s.handleMFADisable)
	auth.Get("/webauthn/credentials", s.handleListPasskeys)
	auth.Delete("/webauthn/credentials/:credID", s.handleDeletePasskey)
	auth.Post("/keys/upload", s.handleUploadKeys)
	auth.Get("/keys/:userID", s.handleGetKeys)

	admin := v1.Group("/admin", s.authMiddleware, s.requireSuperAdmin)
	admin.Get("/users", s.handleAdminUsers)
	admin.Get("/users/:id", s.handleAdminUser)
	admin.Post("/users/:id/suspend", s.handleAdminSuspend)
	admin.Post("/users/:id/reactivate", s.handleAdminReactivate)
	admin.Post("/users/:id/verify-email", s.handleAdminVerifyEmail)
	admin.Post("/users/:id/mfa-enforce", s.handleAdminMFAEnforce)
	admin.Get("/domains", s.handleAdminDomains)
	admin.Post("/domains/:id/verify-override", s.handleAdminDomainOverride)
	admin.Get("/metrics/smtp-queue", s.handleAdminSMTPQueue)
	admin.Get("/metrics/attachments", s.handleAdminAttachments)
	admin.Get("/metrics/pool", s.handleAdminPool)
	admin.Get("/metrics/latency", s.handleAdminLatency)
	admin.Get("/audit", s.handleAdminAudit)

	return app
}

func errorHandler(c *fiber.Ctx, err error) error {
	code := fiber.StatusInternalServerError
	var e *fiber.Error
	if fiberErr, ok := err.(*fiber.Error); ok {
		e = fiberErr
		code = e.Code
	}
	if code == fiber.StatusNotFound {
		return c.Status(code).JSON(fiber.Map{"error": "not found"})
	}
	return c.Status(code).JSON(fiber.Map{"error": err.Error()})
}

func (s *Server) sessionCookie(c *fiber.Ctx, token string) {
	secure := s.Cfg.CookieSecure
	c.Cookie(&fiber.Cookie{
		Name:     s.Cfg.SessionCookieName,
		Value:    token,
		Path:     "/",
		HTTPOnly: true,
		Secure:   secure,
		SameSite: "Strict",
		MaxAge:   int((30 * 24 * time.Hour).Seconds()),
	})
}

func (s *Server) clearSessionCookie(c *fiber.Ctx) {
	c.Cookie(&fiber.Cookie{
		Name:     s.Cfg.SessionCookieName,
		Value:    "",
		Path:     "/",
		HTTPOnly: true,
		Secure:   s.Cfg.CookieSecure,
		SameSite: "Strict",
		MaxAge:   -1,
	})
}

func (s *Server) readSessionToken(c *fiber.Ctx) string {
	if t := c.Cookies(s.Cfg.SessionCookieName); t != "" {
		return t
	}
	h := c.Get("Authorization")
	if strings.HasPrefix(h, "Bearer ") {
		return strings.TrimPrefix(h, "Bearer ")
	}
	return ""
}

func (s *Server) authMiddleware(c *fiber.Ctx) error {
	if s.Cfg.DevMode {
		uid := c.Get("X-User-ID")
		if uid == "" {
			return fiber.NewError(fiber.StatusUnauthorized, "set X-User-ID header")
		}
		c.Locals(localUserID, uid)
		c.Locals(localSuper, false)
		return c.Next()
	}
	token := s.readSessionToken(c)
	if token == "" {
		return fiber.NewError(fiber.StatusUnauthorized, "missing session")
	}
	sess, err := s.Store.ValidateSession(c.Context(), token)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, "invalid session")
	}
	u, err := s.Store.GetUserByID(c.Context(), sess.UserID)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, "invalid session")
	}
	if u.SuspendedAt != nil {
		return fiber.NewError(fiber.StatusForbidden, "account suspended")
	}
	c.Locals(localUserID, u.ID)
	c.Locals(localSuper, u.IsSuperAdmin)
	c.Locals("sessionToken", token)
	return c.Next()
}

func (s *Server) requireSuperAdmin(c *fiber.Ctx) error {
	if v, ok := c.Locals(localSuper).(bool); ok && v {
		return c.Next()
	}
	return fiber.NewError(fiber.StatusForbidden, "forbidden")
}

func (s *Server) userID(c *fiber.Ctx) string {
	v, _ := c.Locals(localUserID).(string)
	return v
}

func (s *Server) writeAudit(c *fiber.Ctx, action, targetType, targetID string, meta map[string]any) {
	var actor *string
	if id := s.userID(c); id != "" {
		actor = &id
	}
	ip := c.IP()
	_ = s.Store.InsertAudit(c.Context(), actor, action, targetType, targetID, meta, ip)
}

// --- Handlers (subset in this file; rest in handlers_*.go if split) ---

func (s *Server) handleRegister(c *fiber.Ctx) error {
	var req model.RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid request body")
	}
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))
	if req.Email == "" || req.Password == "" {
		return fiber.NewError(fiber.StatusBadRequest, "email and password are required")
	}
	if !strings.HasSuffix(req.Email, "@"+allowedDomain) {
		return fiber.NewError(fiber.StatusBadRequest, "email must be an @haseen.me address")
	}
	if len(req.PublicKey) == 0 || len(req.SigningKey) == 0 {
		return fiber.NewError(fiber.StatusBadRequest, "publicKey and signingKey are required")
	}
	if _, err := s.Store.GetUserByEmail(c.Context(), req.Email); err == nil {
		return fiber.NewError(fiber.StatusConflict, "email already registered")
	} else if err != store.ErrNotFound {
		s.Log.Error().Err(err).Msg("db")
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	hash, err := crypto.HashPassword(req.Password)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	user, err := s.Store.CreateUserWithPassword(c.Context(), req.Email, strings.TrimSpace(req.DisplayName), hash)
	if err != nil {
		s.Log.Error().Err(err).Msg("create user")
		return fiber.NewError(fiber.StatusInternalServerError, "failed to create account")
	}
	if err := s.Store.ProvisionUserResources(c.Context(), user.ID); err != nil {
		s.Log.Error().Err(err).Msg("provision user resources")
		return fiber.NewError(fiber.StatusInternalServerError, "failed to provision account")
	}
	sig := req.Signature
	if sig == nil {
		sig = []byte{}
	}
	if _, err := s.Store.StorePublicKeys(c.Context(), user.ID, req.PublicKey, req.SigningKey, sig); err != nil {
		s.Log.Error().Err(err).Msg("keys")
		return fiber.NewError(fiber.StatusInternalServerError, "failed to store keys")
	}
	raw, keyHash, err := store.GenerateRecoveryKey()
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	_ = s.Store.StoreRecoveryKey(c.Context(), user.ID, []byte(raw), keyHash)

	vtok, err := randomURLToken(24)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	_ = s.Store.CreateEmailVerificationToken(c.Context(), user.ID, store.HashOpaqueToken(vtok), time.Now().Add(48*time.Hour))

	token, err := s.Store.CreateSession(c.Context(), user.ID, c.Get("User-Agent"), c.IP())
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	s.sessionCookie(c, token)
	s.writeAudit(c, "user.register", "user", user.ID, map[string]any{"email": user.Email})

	verifyURL := s.Cfg.AppBaseURL + "/accounts/verify-email?token=" + vtok
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"user":          publicUser(user, false),
		"recoveryKey":   raw,
		"emailVerified": false,
		"verifyUrl":     verifyURL,
	})
}

func (s *Server) handleLogin(c *fiber.Ctx) error {
	var req model.LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid request body")
	}
	req.Email = strings.ToLower(strings.TrimSpace(req.Email))
	if req.Email == "" || req.Password == "" {
		return fiber.NewError(fiber.StatusBadRequest, "email and password are required")
	}
	u, err := s.Store.GetUserByEmail(c.Context(), req.Email)
	if err == store.ErrNotFound {
		return fiber.NewError(fiber.StatusUnauthorized, "invalid credentials")
	}
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	if u.SuspendedAt != nil {
		return fiber.NewError(fiber.StatusForbidden, "account suspended")
	}
	if u.PasswordHash == "" || !crypto.VerifyPassword(u.PasswordHash, req.Password) {
		return fiber.NewError(fiber.StatusUnauthorized, "invalid credentials")
	}
	mfaOn, _ := s.Store.IsMFAEnabled(c.Context(), u.ID)
	if u.MFAEnforced && !mfaOn {
		return fiber.NewError(fiber.StatusForbidden, "MFA must be enabled for this account")
	}
	if mfaOn {
		mfaTok, err := randomURLToken(32)
		if err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "internal error")
		}
		if err := s.Store.CreateMFALoginChallenge(c.Context(), u.ID, store.HashOpaqueToken(mfaTok), time.Now().Add(10*time.Minute)); err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "internal error")
		}
		return c.JSON(model.LoginResponse{
			User:          publicUser(u, mfaOn),
			MFARequired:   true,
			MFAToken:      mfaTok,
			EmailVerified: u.EmailVerifiedAt != nil,
		})
	}
	token, err := s.Store.CreateSession(c.Context(), u.ID, c.Get("User-Agent"), c.IP())
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	s.sessionCookie(c, token)
	s.writeAudit(c, "user.login", "user", u.ID, map[string]any{"method": "password"})
	return c.JSON(model.LoginResponse{
		User:          publicUser(u, false),
		EmailVerified: u.EmailVerifiedAt != nil,
	})
}

func (s *Server) handleLoginMFA(c *fiber.Ctx) error {
	var req model.MFALoginRequest
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid request body")
	}
	if req.MFAToken == "" || req.Code == "" {
		return fiber.NewError(fiber.StatusBadRequest, "mfaToken and code are required")
	}
	uid, err := s.Store.ConsumeMFALoginChallenge(c.Context(), req.MFAToken)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, "invalid or expired MFA token")
	}
	secret, enabled, err := s.Store.GetMFASecret(c.Context(), uid)
	if err != nil || !enabled {
		return fiber.NewError(fiber.StatusUnauthorized, "MFA not configured")
	}
	if !totp.Validate(req.Code, secret) {
		return fiber.NewError(fiber.StatusUnauthorized, "invalid MFA code")
	}
	u, err := s.Store.GetUserByID(c.Context(), uid)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	token, err := s.Store.CreateSession(c.Context(), uid, c.Get("User-Agent"), c.IP())
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	s.sessionCookie(c, token)
	s.writeAudit(c, "user.login.mfa", "user", uid, nil)
	return c.JSON(model.LoginResponse{
		User:          publicUser(u, true),
		EmailVerified: u.EmailVerifiedAt != nil,
	})
}

func (s *Server) handleLogout(c *fiber.Ctx) error {
	token := s.readSessionToken(c)
	if token != "" {
		_ = s.Store.DeleteSession(c.Context(), token)
	}
	s.clearSessionCookie(c)
	return c.JSON(model.OkResponse{OK: true})
}

func (s *Server) handleSessionRefresh(c *fiber.Ctx) error {
	token := s.readSessionToken(c)
	if token == "" {
		return fiber.NewError(fiber.StatusUnauthorized, "missing session")
	}
	if err := s.Store.RefreshSession(c.Context(), token); err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, "invalid or expired session")
	}
	s.sessionCookie(c, token)
	return c.JSON(model.OkResponse{OK: true})
}

func (s *Server) handleVerifyEmail(c *fiber.Ctx) error {
	tok := c.Query("token")
	if tok == "" {
		return fiber.NewError(fiber.StatusBadRequest, "token required")
	}
	uid, err := s.Store.ConsumeEmailVerificationToken(c.Context(), tok)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid or expired token")
	}
	if err := s.Store.SetEmailVerified(c.Context(), uid); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid or expired token")
	}
	s.writeAudit(c, "user.email_verified", "user", uid, nil)
	return c.JSON(model.OkResponse{OK: true})
}

func (s *Server) handleForgotPassword(c *fiber.Ctx) error {
	var body struct {
		Email string `json:"email"`
	}
	_ = c.BodyParser(&body)
	body.Email = strings.ToLower(strings.TrimSpace(body.Email))
	// Always OK to avoid email enumeration
	if body.Email == "" {
		return c.JSON(model.OkResponse{OK: true})
	}
	u, err := s.Store.GetUserByEmail(c.Context(), body.Email)
	if err != nil {
		return c.JSON(model.OkResponse{OK: true})
	}
	ptok, err := randomURLToken(32)
	if err != nil {
		return c.JSON(model.OkResponse{OK: true})
	}
	_ = s.Store.CreatePasswordResetToken(c.Context(), u.ID, store.HashOpaqueToken(ptok), time.Now().Add(time.Hour))
	resetURL := s.Cfg.AppBaseURL + "/accounts/reset-password?token=" + ptok
	s.writeAudit(c, "user.password_reset_requested", "user", u.ID, nil)
	return c.JSON(fiber.Map{"ok": true, "resetUrl": resetURL})
}

func (s *Server) handleResetPassword(c *fiber.Ctx) error {
	var body struct {
		Token       string `json:"token"`
		NewPassword string `json:"newPassword"`
	}
	if err := c.BodyParser(&body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid request body")
	}
	if body.Token == "" || body.NewPassword == "" {
		return fiber.NewError(fiber.StatusBadRequest, "token and newPassword are required")
	}
	uid, err := s.Store.ConsumePasswordResetToken(c.Context(), body.Token)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid or expired token")
	}
	hash, err := crypto.HashPassword(body.NewPassword)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	if err := s.Store.UpdatePasswordHash(c.Context(), uid, hash); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	_ = s.Store.DeleteUserSessions(c.Context(), uid)
	tok, err := s.Store.CreateSession(c.Context(), uid, c.Get("User-Agent"), c.IP())
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	s.sessionCookie(c, tok)
	s.writeAudit(c, "user.password_reset", "user", uid, nil)
	return c.JSON(model.OkResponse{OK: true})
}

func (s *Server) handleMe(c *fiber.Ctx) error {
	u, err := s.Store.GetUserByID(c.Context(), s.userID(c))
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	mfa, _ := s.Store.IsMFAEnabled(c.Context(), u.ID)
	return c.JSON(model.MeResponse{User: publicUser(u, mfa)})
}

func (s *Server) handleGetAccount(c *fiber.Ctx) error {
	u, err := s.Store.GetUserByID(c.Context(), s.userID(c))
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	mfa, _ := s.Store.IsMFAEnabled(c.Context(), u.ID)
	hasRec, _ := s.Store.HasRecoveryKey(c.Context(), u.ID)
	return c.JSON(model.AccountResponse{
		User:           publicUser(u, mfa),
		MFAEnabled:     mfa,
		HasRecoveryKey: hasRec,
	})
}

func (s *Server) handleUpdateAccount(c *fiber.Ctx) error {
	var req model.UpdateAccountRequest
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid request body")
	}
	uid := s.userID(c)
	if req.Email != "" {
		email := strings.ToLower(strings.TrimSpace(req.Email))
		if !strings.HasSuffix(email, "@"+allowedDomain) {
			return fiber.NewError(fiber.StatusBadRequest, "email must be an @haseen.me address")
		}
		existing, err := s.Store.GetUserByEmail(c.Context(), email)
		if err == nil && existing.ID != uid {
			return fiber.NewError(fiber.StatusConflict, "email already in use")
		}
		if err == nil || err == store.ErrNotFound {
			if err := s.Store.UpdateUserEmail(c.Context(), uid, email); err != nil {
				return fiber.NewError(fiber.StatusInternalServerError, "internal error")
			}
		}
	}
	if req.DisplayName != "" {
		if err := s.Store.UpdateUserDisplayName(c.Context(), uid, strings.TrimSpace(req.DisplayName)); err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "internal error")
		}
	}
	if req.AvatarURL != "" {
		if err := s.Store.UpdateUserAvatar(c.Context(), uid, strings.TrimSpace(req.AvatarURL)); err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "internal error")
		}
	}
	u, err := s.Store.GetUserByID(c.Context(), uid)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	mfa, _ := s.Store.IsMFAEnabled(c.Context(), uid)
	return c.JSON(fiber.Map{
		"id": u.ID, "email": u.Email, "displayName": u.DisplayName, "avatarUrl": u.AvatarURL,
		"mfaEnabled": mfa, "createdAt": u.CreatedAt,
	})
}

func (s *Server) handleDeleteAccount(c *fiber.Ctx) error {
	uid := s.userID(c)
	if err := s.Store.DeleteUser(c.Context(), uid); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	s.clearSessionCookie(c)
	s.writeAudit(c, "user.delete", "user", uid, nil)
	return c.JSON(model.OkResponse{OK: true})
}

func (s *Server) handleChangePassword(c *fiber.Ctx) error {
	var req model.ChangePasswordRequest
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid request body")
	}
	if req.CurrentPassword == "" || req.NewPassword == "" {
		return fiber.NewError(fiber.StatusBadRequest, "currentPassword and newPassword are required")
	}
	uid := s.userID(c)
	u, err := s.Store.GetUserByID(c.Context(), uid)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	if !crypto.VerifyPassword(u.PasswordHash, req.CurrentPassword) {
		return fiber.NewError(fiber.StatusUnauthorized, "invalid current password")
	}
	hash, err := crypto.HashPassword(req.NewPassword)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, err.Error())
	}
	if err := s.Store.UpdatePasswordHash(c.Context(), uid, hash); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	tok := s.readSessionToken(c)
	_ = s.Store.DeleteOtherSessions(c.Context(), uid, tok)
	s.sessionCookie(c, tok)
	return c.JSON(model.OkResponse{OK: true})
}

func (s *Server) handleRecoveryKey(c *fiber.Ctx) error {
	uid := s.userID(c)
	raw, keyHash, err := store.GenerateRecoveryKey()
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	if err := s.Store.StoreRecoveryKey(c.Context(), uid, []byte(raw), keyHash); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	return c.JSON(model.RecoveryKeyResponse{RecoveryKey: raw})
}

func (s *Server) handleMFASetup(c *fiber.Ctx) error {
	uid := s.userID(c)
	u, err := s.Store.GetUserByID(c.Context(), uid)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	sec, err := totp.GenerateSecret()
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	if err := s.Store.UpsertMFASecret(c.Context(), uid, sec); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	url := totp.OTPAuthURL(sec, u.Email, "Haseen")
	return c.JSON(model.MFASetupResponse{
		Secret:     sec,
		QRCode:     "",
		OTPAuthURL: url,
	})
}

func (s *Server) handleMFAVerifySetup(c *fiber.Ctx) error {
	var req model.MFAVerifySetupRequest
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid request body")
	}
	if req.Code == "" {
		return fiber.NewError(fiber.StatusBadRequest, "code is required")
	}
	uid := s.userID(c)
	secret, _, err := s.Store.GetMFASecret(c.Context(), uid)
	if err != nil || secret == "" {
		return fiber.NewError(fiber.StatusBadRequest, "set up MFA first")
	}
	if !totp.Validate(req.Code, secret) {
		return fiber.NewError(fiber.StatusUnauthorized, "invalid code")
	}
	if err := s.Store.EnableMFA(c.Context(), uid); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	s.writeAudit(c, "user.mfa_enabled", "user", uid, nil)
	return c.JSON(model.OkResponse{OK: true})
}

func (s *Server) handleMFADisable(c *fiber.Ctx) error {
	uid := s.userID(c)
	u, err := s.Store.GetUserByID(c.Context(), uid)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	if u.MFAEnforced {
		return fiber.NewError(fiber.StatusForbidden, "MFA is mandatory for this account")
	}
	if err := s.Store.DisableMFA(c.Context(), uid); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	return c.JSON(model.OkResponse{OK: true})
}

func (s *Server) handleSessionDeleteAll(c *fiber.Ctx) error {
	uid := s.userID(c)
	if err := s.Store.DeleteUserSessions(c.Context(), uid); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	s.clearSessionCookie(c)
	return c.JSON(model.OkResponse{OK: true})
}

func (s *Server) handleListSessions(c *fiber.Ctx) error {
	sessions, err := s.Store.ListUserSessions(c.Context(), s.userID(c))
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	type row struct {
		ID        string    `json:"id"`
		UserAgent string    `json:"userAgent"`
		IPAddress string    `json:"ipAddress"`
		ExpiresAt time.Time `json:"expiresAt"`
		CreatedAt time.Time `json:"createdAt"`
		Current   bool      `json:"current"`
	}
	out := make([]row, 0, len(sessions))
	var curHash string
	if v := c.Locals("sessionToken"); v != nil {
		if tok, ok := v.(string); ok && tok != "" {
			curHash = store.HashSessionToken(tok)
		}
	}
	for _, sess := range sessions {
		r := row{
			ID:        sess.ID,
			UserAgent: sess.UserAgent,
			IPAddress: sess.IPAddress,
			ExpiresAt: sess.ExpiresAt,
			CreatedAt: sess.CreatedAt,
			Current:   curHash != "" && sess.TokenHash == curHash,
		}
		out = append(out, r)
	}
	return c.JSON(out)
}

func (s *Server) handleRevokeSession(c *fiber.Ctx) error {
	sid := c.Params("sessionID")
	if err := s.Store.RevokeSession(c.Context(), sid, s.userID(c)); err != nil {
		if err == store.ErrNotFound {
			return fiber.NewError(fiber.StatusNotFound, "session not found")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	return c.JSON(model.OkResponse{OK: true})
}

func (s *Server) handleUploadKeys(c *fiber.Ctx) error {
	uid := s.userID(c)
	var req model.RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid request body")
	}
	if len(req.PublicKey) == 0 || len(req.SigningKey) == 0 {
		return fiber.NewError(fiber.StatusBadRequest, "publicKey and signingKey are required")
	}
	_ = s.Store.RevokePublicKeys(c.Context(), uid)
	sig := req.Signature
	if sig == nil {
		sig = []byte{}
	}
	bundle, err := s.Store.StorePublicKeys(c.Context(), uid, req.PublicKey, req.SigningKey, sig)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	return c.JSON(bundle)
}

func (s *Server) handleGetKeys(c *fiber.Ctx) error {
	target := c.Params("userID")
	bundle, err := s.Store.GetActivePublicKeys(c.Context(), target)
	if err == store.ErrNotFound {
		return fiber.NewError(fiber.StatusNotFound, "no keys found for user")
	}
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	return c.JSON(bundle)
}

func (s *Server) handleListPasskeys(c *fiber.Ctx) error {
	list, err := s.Store.ListWebAuthnCredentials(c.Context(), s.userID(c))
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	return c.JSON(list)
}

func (s *Server) handleDeletePasskey(c *fiber.Ctx) error {
	credID := c.Params("credID")
	if err := s.Store.DeleteWebAuthnCredential(c.Context(), s.userID(c), credID); err != nil {
		if err == store.ErrNotFound {
			return fiber.NewError(fiber.StatusNotFound, "not found")
		}
		return fiber.NewError(fiber.StatusBadRequest, "invalid credential id")
	}
	return c.JSON(model.OkResponse{OK: true})
}

// --- WebAuthn ---

func (s *Server) handleWABeginRegister(c *fiber.Ctx) error {
	if s.WebAuth == nil {
		return fiber.NewError(fiber.StatusServiceUnavailable, "WebAuthn not configured")
	}
	uid := s.userID(c)
	u, err := s.Store.GetUserByID(c.Context(), uid)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	creds, err := s.Store.WebAuthnCredentialsForUser(c.Context(), uid)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	wu := &webuser.RP{User: u, Creds: creds}
	options, session, err := s.WebAuth.BeginRegistration(wu)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	sessBytes, _ := json.Marshal(session)
	c.Cookie(&fiber.Cookie{
		Name:     sessionDataKey,
		Value:    base64.RawURLEncoding.EncodeToString(sessBytes),
		Path:     "/",
		HTTPOnly: true,
		Secure:   s.Cfg.CookieSecure,
		SameSite: "Strict",
		MaxAge:   300,
	})
	return c.JSON(options)
}

func (s *Server) handleWAFinishRegister(c *fiber.Ctx) error {
	if s.WebAuth == nil {
		return fiber.NewError(fiber.StatusServiceUnavailable, "WebAuthn not configured")
	}
	uid := s.userID(c)
	raw := c.Cookies(sessionDataKey)
	if raw == "" {
		return fiber.NewError(fiber.StatusBadRequest, "missing webauthn session")
	}
	sessBytes, err := base64.RawURLEncoding.DecodeString(raw)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid webauthn session")
	}
	var session webauthn.SessionData
	if err := json.Unmarshal(sessBytes, &session); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid webauthn session")
	}
	u, err := s.Store.GetUserByID(c.Context(), uid)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	creds, err := s.Store.WebAuthnCredentialsForUser(c.Context(), uid)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	wu := &webuser.RP{User: u, Creds: creds}

	req, err := http.NewRequestWithContext(c.Context(), http.MethodPost, "/", bytes.NewReader(c.Body()))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid request")
	}
	req.Header.Set("Content-Type", "application/json")
	credential, err := s.WebAuth.FinishRegistration(wu, session, req)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, err.Error())
	}
	name := strings.TrimSpace(c.Query("name"))
	if err := s.Store.UpsertWebAuthnCredential(c.Context(), uid, credential, name); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	c.Cookie(&fiber.Cookie{Name: sessionDataKey, Value: "", MaxAge: -1, Path: "/"})
	s.writeAudit(c, "user.webauthn_register", "user", uid, nil)
	return c.JSON(model.OkResponse{OK: true})
}

func (s *Server) handleWABeginLogin(c *fiber.Ctx) error {
	if s.WebAuth == nil {
		return fiber.NewError(fiber.StatusServiceUnavailable, "WebAuthn not configured")
	}
	var body struct {
		Email string `json:"email"`
	}
	if err := c.BodyParser(&body); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid request body")
	}
	email := strings.ToLower(strings.TrimSpace(body.Email))
	if email == "" {
		return fiber.NewError(fiber.StatusBadRequest, "email is required")
	}
	u, err := s.Store.GetUserByEmail(c.Context(), email)
	if err == store.ErrNotFound {
		return fiber.NewError(fiber.StatusUnauthorized, "unknown user")
	}
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	if u.SuspendedAt != nil {
		return fiber.NewError(fiber.StatusForbidden, "account suspended")
	}
	creds, err := s.Store.WebAuthnCredentialsForUser(c.Context(), u.ID)
	if err != nil || len(creds) == 0 {
		return fiber.NewError(fiber.StatusBadRequest, "no passkeys registered")
	}
	wu := &webuser.RP{User: u, Creds: creds}
	options, session, err := s.WebAuth.BeginLogin(wu)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, err.Error())
	}
	sessBytes, _ := json.Marshal(session)
	c.Cookie(&fiber.Cookie{
		Name:     sessionDataKey,
		Value:    base64.RawURLEncoding.EncodeToString(sessBytes),
		Path:     "/",
		HTTPOnly: true,
		Secure:   s.Cfg.CookieSecure,
		SameSite: "Strict",
		MaxAge:   300,
	})
	return c.JSON(options)
}

func (s *Server) handleWAFinishLogin(c *fiber.Ctx) error {
	if s.WebAuth == nil {
		return fiber.NewError(fiber.StatusServiceUnavailable, "WebAuthn not configured")
	}
	raw := c.Cookies(sessionDataKey)
	if raw == "" {
		return fiber.NewError(fiber.StatusBadRequest, "missing webauthn session")
	}
	sessBytes, err := base64.RawURLEncoding.DecodeString(raw)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid webauthn session")
	}
	var session webauthn.SessionData
	if err := json.Unmarshal(sessBytes, &session); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid webauthn session")
	}
	uid, err := uuidFromWebAuthnUserHandle(session.UserID)
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid webauthn session")
	}
	u, err := s.Store.GetUserByID(c.Context(), uid)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, "unknown user")
	}
	creds, err := s.Store.WebAuthnCredentialsForUser(c.Context(), uid)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	wu := &webuser.RP{User: u, Creds: creds}
	req, err := http.NewRequestWithContext(c.Context(), http.MethodPost, "/", bytes.NewReader(c.Body()))
	if err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid request")
	}
	req.Header.Set("Content-Type", "application/json")
	credential, err := s.WebAuth.FinishLogin(wu, session, req)
	if err != nil {
		return fiber.NewError(fiber.StatusUnauthorized, err.Error())
	}
	_ = s.Store.UpdateWebAuthnSignCount(c.Context(), credential.ID, credential.Authenticator.SignCount)
	mfaOn, _ := s.Store.IsMFAEnabled(c.Context(), uid)
	if u.MFAEnforced && !mfaOn {
		return fiber.NewError(fiber.StatusForbidden, "MFA must be enabled for this account")
	}
	if mfaOn {
		mfaTok, err := randomURLToken(32)
		if err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "internal error")
		}
		if err := s.Store.CreateMFALoginChallenge(c.Context(), uid, store.HashOpaqueToken(mfaTok), time.Now().Add(10*time.Minute)); err != nil {
			return fiber.NewError(fiber.StatusInternalServerError, "internal error")
		}
		c.Cookie(&fiber.Cookie{Name: sessionDataKey, Value: "", MaxAge: -1, Path: "/"})
		return c.JSON(model.LoginResponse{
			User:          publicUser(u, mfaOn),
			MFARequired:   true,
			MFAToken:      mfaTok,
			EmailVerified: u.EmailVerifiedAt != nil,
		})
	}
	token, err := s.Store.CreateSession(c.Context(), uid, c.Get("User-Agent"), c.IP())
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	s.sessionCookie(c, token)
	c.Cookie(&fiber.Cookie{Name: sessionDataKey, Value: "", MaxAge: -1, Path: "/"})
	s.writeAudit(c, "user.login", "user", uid, map[string]any{"method": "webauthn"})
	return c.JSON(model.LoginResponse{
		User:          publicUser(u, false),
		EmailVerified: u.EmailVerifiedAt != nil,
	})
}

// --- Admin ---

func (s *Server) handleAdminUsers(c *fiber.Ctx) error {
	q := c.Query("q")
	limit := c.QueryInt("limit", 50)
	offset := c.QueryInt("offset", 0)
	rows, total, err := s.Store.AdminListUsers(c.Context(), q, limit, offset)
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	for i := range rows {
		rows[i].PasswordHash = ""
	}
	return c.JSON(fiber.Map{"users": rows, "total": total})
}

func (s *Server) handleAdminUser(c *fiber.Ctx) error {
	u, err := s.Store.AdminGetUser(c.Context(), c.Params("id"))
	if err == store.ErrNotFound {
		return fiber.NewError(fiber.StatusNotFound, "not found")
	}
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	u.PasswordHash = ""
	return c.JSON(u)
}

func (s *Server) handleAdminSuspend(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := s.Store.SetSuspended(c.Context(), id, true); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	_ = s.Store.DeleteUserSessions(c.Context(), id)
	s.writeAudit(c, "admin.user_suspend", "user", id, nil)
	return c.JSON(model.OkResponse{OK: true})
}

func (s *Server) handleAdminReactivate(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := s.Store.SetSuspended(c.Context(), id, false); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	s.writeAudit(c, "admin.user_reactivate", "user", id, nil)
	return c.JSON(model.OkResponse{OK: true})
}

func (s *Server) handleAdminVerifyEmail(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := s.Store.SetEmailVerified(c.Context(), id); err != nil && err != store.ErrNotFound {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	s.writeAudit(c, "admin.email_verified", "user", id, nil)
	return c.JSON(model.OkResponse{OK: true})
}

func (s *Server) handleAdminMFAEnforce(c *fiber.Ctx) error {
	var body struct {
		Enforced bool `json:"enforced"`
	}
	_ = c.BodyParser(&body)
	id := c.Params("id")
	if err := s.Store.SetMFAEnforced(c.Context(), id, body.Enforced); err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	return c.JSON(model.OkResponse{OK: true})
}

func (s *Server) handleAdminDomains(c *fiber.Ctx) error {
	d, err := s.Store.AdminListDomains(c.Context(), c.QueryInt("limit", 100))
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	return c.JSON(fiber.Map{"domains": d})
}

func (s *Server) handleAdminDomainOverride(c *fiber.Ctx) error {
	id := c.Params("id")
	if err := s.Store.AdminOverrideDomainVerify(c.Context(), id); err != nil {
		if err == store.ErrNotFound {
			return fiber.NewError(fiber.StatusNotFound, "not found")
		}
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	s.writeAudit(c, "admin.domain_verify_override", "domain", id, nil)
	return c.JSON(model.OkResponse{OK: true})
}

func (s *Server) handleAdminSMTPQueue(c *fiber.Ctx) error {
	q, sen, sent, def, fail, err := s.Store.AdminQueueStats(c.Context())
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	return c.JSON(fiber.Map{
		"queued": q, "pendingDelivery": q + sen + def, "sending": sen, "delivered": sent, "bounced": fail,
	})
}

func (s *Server) handleAdminAttachments(c *fiber.Ctx) error {
	n, bytes, err := s.Store.AdminAttachmentStats(c.Context())
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	return c.JSON(fiber.Map{"attachmentCount": n, "totalBytes": bytes})
}

func (s *Server) handleAdminPool(c *fiber.Ctx) error {
	a, i, m, err := s.Store.AdminPoolStats(c.Context())
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	return c.JSON(fiber.Map{"dbPoolAcquired": a, "dbPoolIdle": i, "dbPoolMax": m})
}

func (s *Server) handleAdminLatency(c *fiber.Ctx) error {
	start := time.Now()
	_ = s.Store.Ping(c.Context())
	return c.JSON(fiber.Map{"authDbPingMs": time.Since(start).Milliseconds()})
}

func (s *Server) handleAdminAudit(c *fiber.Ctx) error {
	ev, err := s.Store.ListAudit(c.Context(), c.QueryInt("limit", 100))
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "internal error")
	}
	return c.JSON(fiber.Map{"events": ev})
}

// --- helpers ---

func publicUser(u *model.User, mfa bool) model.User {
	out := *u
	out.PasswordHash = ""
	out.MFAEnforced = u.MFAEnforced
	_ = mfa
	return out
}

func randomURLToken(nbytes int) (string, error) {
	b := make([]byte, nbytes)
	if _, err := io.ReadFull(rand.Reader, b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}

func uuidFromWebAuthnUserHandle(b []byte) (string, error) {
	if len(b) != 16 {
		return "", io.EOF
	}
	var out [36]byte
	hex.Encode(out[:8], b[:4])
	out[8] = '-'
	hex.Encode(out[9:13], b[4:6])
	out[13] = '-'
	hex.Encode(out[14:18], b[6:8])
	out[18] = '-'
	hex.Encode(out[19:23], b[8:10])
	out[23] = '-'
	hex.Encode(out[24:], b[10:])
	return string(out[:]), nil
}
