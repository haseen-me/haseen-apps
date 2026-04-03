package totp

import (
	"encoding/base32"
	"strings"
	"testing"
	"time"
)

func TestGenerateSecret(t *testing.T) {
	s1, err := GenerateSecret()
	if err != nil {
		t.Fatal(err)
	}
	s2, err := GenerateSecret()
	if err != nil {
		t.Fatal(err)
	}
	if s1 == "" || s2 == "" {
		t.Fatal("secret should not be empty")
	}
	if s1 == s2 {
		t.Fatal("two secrets should differ")
	}

	padded := s1
	if m := len(padded) % 8; m != 0 {
		padded += strings.Repeat("=", 8-m)
	}
	b, err := base32.StdEncoding.DecodeString(padded)
	if err != nil {
		t.Fatalf("secret should be valid base32: %v", err)
	}
	if len(b) != 20 {
		t.Fatalf("decoded secret should be 20 bytes, got %d", len(b))
	}
}

func TestGenerateCode_NonEmpty(t *testing.T) {
	secret, _ := GenerateSecret()
	counter := time.Now().Unix() / period
	code := generateCode(secret, counter)
	if code == "" {
		t.Fatal("code should not be empty")
	}
	if len(code) != digits {
		t.Fatalf("code should be %d digits, got %d", digits, len(code))
	}
}

func TestGenerateCode_Deterministic(t *testing.T) {
	secret := "JBSWY3DPEHPK3PXP"
	counter := int64(1000000)
	c1 := generateCode(secret, counter)
	c2 := generateCode(secret, counter)
	if c1 != c2 {
		t.Fatalf("same inputs should produce same code: %s != %s", c1, c2)
	}
}

func TestGenerateCode_DifferentCounters(t *testing.T) {
	secret, _ := GenerateSecret()
	c1 := generateCode(secret, 100)
	c2 := generateCode(secret, 101)
	if len(c1) != digits || len(c2) != digits {
		t.Fatal("codes should be 6 digits")
	}
}

func TestValidate_CurrentCode(t *testing.T) {
	secret, _ := GenerateSecret()
	counter := time.Now().Unix() / period
	code := generateCode(secret, counter)
	if Validate(code, secret) == false {
		t.Fatal("should validate current code")
	}
}

func TestValidate_PreviousStep(t *testing.T) {
	secret, _ := GenerateSecret()
	counter := time.Now().Unix()/period - 1
	code := generateCode(secret, counter)
	if Validate(code, secret) == false {
		t.Fatal("should accept previous time step (skew -1)")
	}
}

func TestValidate_NextStep(t *testing.T) {
	secret, _ := GenerateSecret()
	counter := time.Now().Unix()/period + 1
	code := generateCode(secret, counter)
	if Validate(code, secret) == false {
		t.Fatal("should accept next time step (skew +1)")
	}
}

func TestValidate_WrongCode(t *testing.T) {
	secret, _ := GenerateSecret()
	counter := time.Now().Unix() / period
	validCode := generateCode(secret, counter)
	wrongCode := "000000"
	if wrongCode == validCode {
		wrongCode = "999999"
	}
	if Validate(wrongCode, secret) {
		t.Fatal("should reject wrong code")
	}
}

func TestValidate_FarFuture(t *testing.T) {
	secret, _ := GenerateSecret()
	counter := time.Now().Unix()/period + 100
	code := generateCode(secret, counter)
	if Validate(code, secret) {
		t.Fatal("should reject code from far future")
	}
}

func TestOTPAuthURL(t *testing.T) {
	url := OTPAuthURL("JBSWY3DPEHPK3PXP", "alice@example.com", "Haseen")
	expected := "otpauth://totp/Haseen:alice@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Haseen&algorithm=SHA1&digits=6&period=30"
	if url != expected {
		t.Fatalf("unexpected URL:\n  got:  %s\n  want: %s", url, expected)
	}
}
