package model

import "time"

// PublicKeyBundle is the public key set for a user.
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

// SignedPreKey is a one-time pre-key for async E2E key exchange.
type SignedPreKey struct {
	ID        string    `json:"id"`
	UserID    string    `json:"userId"`
	KeyID     int       `json:"keyId"`
	PublicKey []byte    `json:"publicKey"`
	Signature []byte    `json:"signature"`
	IsUsed    bool      `json:"isUsed"`
	CreatedAt time.Time `json:"createdAt"`
}

// --- API request/response types ---

type LookupRequest struct {
	UserIDs []string `json:"userIds"`
}

type LookupResponse struct {
	Keys map[string]*PublicKeyBundle `json:"keys"`
}

type PublishRequest struct {
	EncryptionPublicKey []byte `json:"encryptionPublicKey"`
	SigningPublicKey    []byte `json:"signingPublicKey"`
	SelfSignature       []byte `json:"selfSignature"`
}

type RotateRequest struct {
	NewEncryptionPublicKey []byte `json:"newEncryptionPublicKey"`
	NewSigningPublicKey    []byte `json:"newSigningPublicKey"`
	NewSelfSignature       []byte `json:"newSelfSignature"`
}

type UploadPreKeysRequest struct {
	PreKeys []PreKeyUpload `json:"preKeys"`
}

type PreKeyUpload struct {
	KeyID     int    `json:"keyId"`
	PublicKey []byte `json:"publicKey"`
	Signature []byte `json:"signature"`
}

type PreKeyResponse struct {
	KeyBundle *PublicKeyBundle `json:"keyBundle"`
	PreKey    *SignedPreKey    `json:"preKey,omitempty"`
}

type OkResponse struct {
	OK bool `json:"ok"`
}
