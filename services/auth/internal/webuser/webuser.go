package webuser

import (
	"github.com/go-webauthn/webauthn/webauthn"
	"github.com/google/uuid"
	"github.com/haseen-me/haseen-apps/services/auth/internal/model"
)

// RP implements webauthn.User for registration and login ceremonies.
type RP struct {
	User  *model.User
	Creds []webauthn.Credential
}

func (u *RP) WebAuthnID() []byte {
	id, err := uuid.Parse(u.User.ID)
	if err != nil {
		return []byte(u.User.ID)
	}
	b := id[:]
	return b[:]
}

func (u *RP) WebAuthnName() string {
	return u.User.Email
}

func (u *RP) WebAuthnDisplayName() string {
	if u.User.DisplayName != "" {
		return u.User.DisplayName
	}
	return u.User.Email
}

func (u *RP) WebAuthnIcon() string {
	return ""
}

func (u *RP) WebAuthnCredentials() []webauthn.Credential {
	return u.Creds
}
