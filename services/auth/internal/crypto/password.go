package crypto

import (
	"crypto/rand"
	"crypto/subtle"
	"encoding/base64"
	"errors"
	"fmt"
	"strings"

	"golang.org/x/crypto/argon2"
)

const (
	saltLen   = 16
	timeCost  = 3
	memoryKiB = 64 * 1024
	threads   = 4
	keyLen    = 32
)

// HashPassword returns an Argon2id-encoded string suitable for storage.
func HashPassword(password string) (string, error) {
	if len(password) < 10 {
		return "", errors.New("password too short")
	}
	salt := make([]byte, saltLen)
	if _, err := rand.Read(salt); err != nil {
		return "", err
	}
	hash := argon2.IDKey([]byte(password), salt, timeCost, memoryKiB, threads, keyLen)
	// Format: argon2id$m,t,p$mem$time$par$salt$hash (all numeric for easy parse)
	return fmt.Sprintf(
		"argon2id$m=%d$t=%d$p=%d$%s$%s",
		memoryKiB, timeCost, threads,
		base64.RawStdEncoding.EncodeToString(salt),
		base64.RawStdEncoding.EncodeToString(hash),
	), nil
}

// VerifyPassword checks a password against a string from HashPassword.
func VerifyPassword(encoded, password string) bool {
	const prefix = "argon2id$"
	if !strings.HasPrefix(encoded, prefix) {
		return false
	}
	rest := strings.TrimPrefix(encoded, prefix)
	parts := strings.SplitN(rest, "$", 5)
	if len(parts) != 5 {
		return false
	}
	var mem, time uint32
	var par uint8
	if _, err := fmt.Sscanf(parts[0], "m=%d", &mem); err != nil {
		return false
	}
	if _, err := fmt.Sscanf(parts[1], "t=%d", &time); err != nil {
		return false
	}
	if _, err := fmt.Sscanf(parts[2], "p=%d", &par); err != nil {
		return false
	}
	salt, err := base64.RawStdEncoding.DecodeString(parts[3])
	if err != nil {
		return false
	}
	want, err := base64.RawStdEncoding.DecodeString(parts[4])
	if err != nil {
		return false
	}
	got := argon2.IDKey([]byte(password), salt, time, mem, par, uint32(len(want)))
	return subtle.ConstantTimeCompare(got, want) == 1
}
