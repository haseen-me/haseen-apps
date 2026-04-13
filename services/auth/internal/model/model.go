package model

import "time"

// User represents a registered Haseen user.
type User struct {
	ID              string     `json:"id"`
	Email           string     `json:"email"`
	DisplayName     string     `json:"displayName,omitempty"`
	PasswordHash    string     `json:"-"`
	AvatarURL       string     `json:"avatarUrl,omitempty"`
	EmailVerifiedAt *time.Time `json:"emailVerifiedAt,omitempty"`
	SuspendedAt     *time.Time `json:"suspendedAt,omitempty"`
	MFAEnforced     bool       `json:"mfaEnforced"`
	IsAdmin         bool       `json:"isAdmin"`
	IsSuperAdmin    bool       `json:"isSuperAdmin"`
	CreatedAt       time.Time  `json:"createdAt"`
	UpdatedAt       time.Time  `json:"updatedAt"`
}

// PublicKeyBundle stores the user's public encryption + signing keys.
type PublicKeyBundle struct {
	ID                   string     `json:"id"`
	UserID               string     `json:"userId"`
	EncryptionPublicKey  []byte     `json:"encryptionPublicKey"`
	SigningPublicKey     []byte     `json:"signingPublicKey"`
	SelfSignature        []byte     `json:"selfSignature"`
	IsActive             bool       `json:"isActive"`
	CreatedAt            time.Time  `json:"createdAt"`
	RevokedAt            *time.Time `json:"revokedAt,omitempty"`
}

// Session represents an authenticated session.
type Session struct {
	ID        string    `json:"id"`
	UserID    string    `json:"userId"`
	TokenHash string    `json:"-"`
	UserAgent string    `json:"userAgent,omitempty"`
	IPAddress string    `json:"ipAddress,omitempty"`
	ExpiresAt time.Time `json:"expiresAt"`
	CreatedAt time.Time `json:"createdAt"`
}

// MFASecret stores a user's TOTP secret for MFA.
type MFASecret struct {
	ID        string    `json:"id"`
	UserID    string    `json:"userId"`
	Secret    string    `json:"-"`
	Enabled   bool      `json:"enabled"`
	CreatedAt time.Time `json:"createdAt"`
}

// RecoveryKey stores an encrypted recovery key for the user.
type RecoveryKey struct {
	ID           string    `json:"id"`
	UserID       string    `json:"userId"`
	EncryptedKey []byte    `json:"-"`
	KeyHash      string    `json:"-"`
	CreatedAt    time.Time `json:"createdAt"`
}

// WebAuthnCredential is a registered passkey.
type WebAuthnCredential struct {
	ID              string     `json:"id"`
	UserID          string     `json:"userId"`
	Name            string     `json:"name"`
	CreatedAt       time.Time  `json:"createdAt"`
	LastUsedAt      *time.Time `json:"lastUsedAt,omitempty"`
	SignCount       uint32     `json:"signCount"`
	CredentialIDB64 string     `json:"credentialId"`
}

// --- API request/response types ---

type RegisterRequest struct {
	Email       string `json:"email"`
	Password    string `json:"password"`
	DisplayName string `json:"displayName"`
	PublicKey   []byte `json:"publicKey"`
	SigningKey  []byte `json:"signingKey"`
	Signature   []byte `json:"signature"`
}

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginResponse struct {
	User          User   `json:"user"`
	MFARequired   bool   `json:"mfaRequired,omitempty"`
	MFAToken      string `json:"mfaToken,omitempty"`
	EmailVerified bool   `json:"emailVerified"`
}

type MFALoginRequest struct {
	MFAToken string `json:"mfaToken"`
	Code     string `json:"code"`
}

type MFASetupResponse struct {
	Secret     string `json:"secret"`
	QRCode     string `json:"qrCode"`
	OTPAuthURL string `json:"otpAuthUrl"`
}

type MFAVerifySetupRequest struct {
	Code string `json:"code"`
}

type UpdateAccountRequest struct {
	Email       string `json:"email,omitempty"`
	DisplayName string `json:"displayName,omitempty"`
	AvatarURL   string `json:"avatarUrl,omitempty"`
}

type ChangePasswordRequest struct {
	CurrentPassword string `json:"currentPassword"`
	NewPassword     string `json:"newPassword"`
}

type RecoveryKeyResponse struct {
	RecoveryKey string `json:"recoveryKey"`
}

type AccountResponse struct {
	User           User `json:"user"`
	MFAEnabled     bool `json:"mfaEnabled"`
	HasRecoveryKey bool `json:"hasRecoveryKey"`
}

type OkResponse struct {
	OK bool `json:"ok"`
}

type MeResponse struct {
	User User `json:"user"`
}

type AuditEvent struct {
	ID         string         `json:"id"`
	ActorID    *string        `json:"actorId,omitempty"`
	Action     string         `json:"action"`
	TargetType string         `json:"targetType"`
	TargetID   string         `json:"targetId"`
	Metadata   map[string]any `json:"metadata"`
	IPAddress  string         `json:"ipAddress,omitempty"`
	CreatedAt  time.Time      `json:"createdAt"`
}

type AdminUserRow struct {
	User
	MFAEnabled     bool `json:"mfaEnabled"`
	EmailVerified  bool `json:"emailVerified"`
	SessionCount   int  `json:"sessionCount"`
}
