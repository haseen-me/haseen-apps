package model

import "time"

// User represents a registered Haseen user.
type User struct {
	ID          string    `json:"id"`
	Email       string    `json:"email"`
	SRPSalt     string    `json:"-"`
	SRPVerifier string    `json:"-"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

// PublicKeyBundle stores the user's public encryption + signing keys.
type PublicKeyBundle struct {
	ID                  string     `json:"id"`
	UserID              string     `json:"userId"`
	EncryptionPublicKey []byte     `json:"encryptionPublicKey"`
	SigningPublicKey    []byte     `json:"signingPublicKey"`
	SelfSignature       []byte     `json:"selfSignature"`
	IsActive            bool       `json:"isActive"`
	CreatedAt           time.Time  `json:"createdAt"`
	RevokedAt           *time.Time `json:"revokedAt,omitempty"`
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

// --- API request/response types ---

type RegisterRequest struct {
	Email       string `json:"email"`
	SRPSalt     string `json:"srpSalt"`
	SRPVerifier string `json:"srpVerifier"`
	PublicKey   []byte `json:"publicKey"`
	SigningKey  []byte `json:"signingKey"`
	Signature   []byte `json:"signature"`
}

type RegisterResponse struct {
	UserID       string `json:"userId"`
	SessionToken string `json:"sessionToken"`
	RecoveryKey  string `json:"recoveryKey"`
}

type LoginInitRequest struct {
	Email string `json:"email"`
	SRPA  string `json:"srpA"`
}

type LoginInitResponse struct {
	SRPB    string `json:"srpB"`
	SRPSalt string `json:"srpSalt"`
}

type LoginVerifyRequest struct {
	Email string `json:"email"`
	SRPM1 string `json:"srpM1"`
}

type LoginVerifyResponse struct {
	SessionToken string `json:"sessionToken"`
	SRPM2        string `json:"srpM2"`
	User         User   `json:"user"`
	MFARequired  bool   `json:"mfaRequired,omitempty"`
}

type MFAVerifyRequest struct {
	Email string `json:"email"`
	Code  string `json:"code"`
	SRPM1 string `json:"srpM1"`
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
	Email string `json:"email,omitempty"`
}

type ChangePasswordRequest struct {
	NewSRPSalt     string `json:"newSrpSalt"`
	NewSRPVerifier string `json:"newSrpVerifier"`
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

type ErrorResponse struct {
	Error string `json:"error"`
}
