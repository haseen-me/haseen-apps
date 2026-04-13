package store

import (
	"context"
	"time"

	"github.com/go-webauthn/webauthn/webauthn"
	"github.com/haseen-me/haseen-apps/services/auth/internal/model"
)

// DataStore defines persistence for the identity service.
type DataStore interface {
	CreateUserWithPassword(ctx context.Context, email, displayName, passwordHash string) (*model.User, error)
	GetUserByEmail(ctx context.Context, email string) (*model.User, error)
	GetUserByID(ctx context.Context, id string) (*model.User, error)
	UpdateUserEmail(ctx context.Context, id, email string) error
	UpdateUserDisplayName(ctx context.Context, id, displayName string) error
	UpdateUserAvatar(ctx context.Context, id, avatarURL string) error
	UpdatePasswordHash(ctx context.Context, id, hash string) error
	SetEmailVerified(ctx context.Context, id string) error
	SetSuspended(ctx context.Context, id string, suspended bool) error
	SetMFAEnforced(ctx context.Context, id string, enforced bool) error
	DeleteUser(ctx context.Context, id string) error

	CreateSession(ctx context.Context, userID, userAgent, ipAddress string) (string, error)
	ValidateSession(ctx context.Context, token string) (*model.Session, error)
	DeleteSession(ctx context.Context, token string) error
	DeleteUserSessions(ctx context.Context, userID string) error
	DeleteOtherSessions(ctx context.Context, userID, keepTokenHash string) error
	RefreshSession(ctx context.Context, token string) error
	ListUserSessions(ctx context.Context, userID string) ([]model.Session, error)
	RevokeSession(ctx context.Context, sessionID, userID string) error
	CleanExpiredSessions(ctx context.Context) (int64, error)

	GetMFASecret(ctx context.Context, userID string) (string, bool, error)
	UpsertMFASecret(ctx context.Context, userID, secret string) error
	EnableMFA(ctx context.Context, userID string) error
	DisableMFA(ctx context.Context, userID string) error
	IsMFAEnabled(ctx context.Context, userID string) (bool, error)
	StoreRecoveryKey(ctx context.Context, userID string, encryptedKey []byte, keyHash string) error
	HasRecoveryKey(ctx context.Context, userID string) (bool, error)

	StorePublicKeys(ctx context.Context, userID string, encKey, signKey, sig []byte) (*model.PublicKeyBundle, error)
	GetActivePublicKeys(ctx context.Context, userID string) (*model.PublicKeyBundle, error)
	RevokePublicKeys(ctx context.Context, userID string) error

	CreateEmailVerificationToken(ctx context.Context, userID string, tokenHash string, expiresAt time.Time) error
	ConsumeEmailVerificationToken(ctx context.Context, token string) (userID string, err error)
	CreatePasswordResetToken(ctx context.Context, userID string, tokenHash string, expiresAt time.Time) error
	ConsumePasswordResetToken(ctx context.Context, token string) (userID string, err error)

	CreateMFALoginChallenge(ctx context.Context, userID, tokenHash string, expiresAt time.Time) error
	ConsumeMFALoginChallenge(ctx context.Context, token string) (userID string, err error)

	InsertAudit(ctx context.Context, actorID *string, action, targetType, targetID string, meta map[string]any, ip string) error
	ListAudit(ctx context.Context, limit int) ([]model.AuditEvent, error)

	// WebAuthn
	ListWebAuthnCredentials(ctx context.Context, userID string) ([]model.WebAuthnCredential, error)
	UpsertWebAuthnCredential(ctx context.Context, userID string, cred *webauthn.Credential, name string) error
	UpdateWebAuthnSignCount(ctx context.Context, credID []byte, signCount uint32) error
	DeleteWebAuthnCredential(ctx context.Context, userID, credID string) error
	WebAuthnCredentialsForUser(ctx context.Context, userID string) ([]webauthn.Credential, error)

	// Admin
	AdminListUsers(ctx context.Context, q string, limit, offset int) ([]model.AdminUserRow, int, error)
	AdminGetUser(ctx context.Context, id string) (*model.AdminUserRow, error)
	AdminQueueStats(ctx context.Context) (queued, sending, sent, deferred, failed int64, err error)
	AdminAttachmentStats(ctx context.Context) (count int64, totalBytes int64, err error)
	AdminListDomains(ctx context.Context, limit int) ([]AdminDomainRow, error)
	AdminOverrideDomainVerify(ctx context.Context, domainID string) error
	AdminPoolStats(ctx context.Context) (acquired, idle, max int32, err error)
	Ping(ctx context.Context) error
}

// AdminDomainRow is a domain row for the admin console.
type AdminDomainRow struct {
	ID             string     `json:"id"`
	UserID         string     `json:"userId"`
	Domain         string     `json:"domain"`
	Status         string     `json:"status"`
	MXVerified     bool       `json:"mxVerified"`
	SPFVerified    bool       `json:"spfVerified"`
	DKIMVerified   bool       `json:"dkimVerified"`
	DMARCVerified  bool       `json:"dmarcVerified"`
	LastCheckedAt  *time.Time `json:"lastCheckedAt,omitempty"`
	VerifiedAt     *time.Time `json:"verifiedAt,omitempty"`
	CreatedAt      time.Time  `json:"createdAt"`
}
