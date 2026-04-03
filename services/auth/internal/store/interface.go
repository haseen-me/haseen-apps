package store

import (
	"context"

	"github.com/haseen-me/haseen-apps/services/auth/internal/model"
)

// DataStore defines the interface for all persistence operations.
// The concrete Store type satisfies this interface.
type DataStore interface {
	CreateUser(ctx context.Context, email, srpSalt, srpVerifier string) (*model.User, error)
	GetUserByEmail(ctx context.Context, email string) (*model.User, error)
	GetUserByID(ctx context.Context, id string) (*model.User, error)
	UpdateUserEmail(ctx context.Context, id, email string) error
	UpdateUserSRP(ctx context.Context, id, srpSalt, srpVerifier string) error
	DeleteUser(ctx context.Context, id string) error

	CreateSession(ctx context.Context, userID, userAgent, ipAddress string) (string, error)
	ValidateSession(ctx context.Context, token string) (*model.Session, error)
	DeleteSession(ctx context.Context, token string) error
	DeleteUserSessions(ctx context.Context, userID string) error
	RefreshSession(ctx context.Context, token string) error

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
}
