package totp

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha1"
	"encoding/base32"
	"encoding/binary"
	"fmt"
	"math"
	"strings"
	"time"
)

const (
	digits = 6
	period = 30
)

// GenerateSecret creates a random 20-byte TOTP secret, returned as base32.
func GenerateSecret() (string, error) {
	b := make([]byte, 20)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return strings.TrimRight(base32.StdEncoding.EncodeToString(b), "="), nil
}

// Validate checks a TOTP code against the secret, allowing ±1 time step skew.
func Validate(code, secret string) bool {
	now := time.Now().Unix() / period
	for _, offset := range []int64{-1, 0, 1} {
		if generateCode(secret, now+offset) == code {
			return true
		}
	}
	return false
}

// OTPAuthURL returns the otpauth:// URI for QR code generation.
func OTPAuthURL(secret, email, issuer string) string {
	return fmt.Sprintf("otpauth://totp/%s:%s?secret=%s&issuer=%s&algorithm=SHA1&digits=%d&period=%d",
		issuer, email, secret, issuer, digits, period)
}

func generateCode(secret string, counter int64) string {
	// Decode base32 secret (pad if needed)
	s := strings.ToUpper(secret)
	if m := len(s) % 8; m != 0 {
		s += strings.Repeat("=", 8-m)
	}
	key, err := base32.StdEncoding.DecodeString(s)
	if err != nil {
		return ""
	}

	// HMAC-SHA1(key, counter)
	buf := make([]byte, 8)
	binary.BigEndian.PutUint64(buf, uint64(counter))
	mac := hmac.New(sha1.New, key)
	mac.Write(buf)
	hash := mac.Sum(nil)

	// Dynamic truncation
	offset := hash[len(hash)-1] & 0x0f
	code := binary.BigEndian.Uint32(hash[offset:offset+4]) & 0x7fffffff
	otp := code % uint32(math.Pow10(digits))

	return fmt.Sprintf("%0*d", digits, otp)
}
