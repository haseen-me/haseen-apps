package srp

import (
	"crypto/sha256"
	"math/big"
	"testing"
)

func TestGenerateSalt(t *testing.T) {
	s1, err := GenerateSalt()
	if err != nil {
		t.Fatal(err)
	}
	s2, err := GenerateSalt()
	if err != nil {
		t.Fatal(err)
	}
	if s1 == "" || s2 == "" {
		t.Fatal("salt should not be empty")
	}
	if s1 == s2 {
		t.Fatal("two salts should differ")
	}
}

func TestComputeVerifier_Deterministic(t *testing.T) {
	salt := "abcdef0123456789"
	email := "test@example.com"
	password := "hunter2"
	v1 := ComputeVerifier(salt, email, password)
	v2 := ComputeVerifier(salt, email, password)
	if v1 != v2 {
		t.Fatalf("verifier not deterministic: %s != %s", v1, v2)
	}
	if v1 == "" || v1 == "0" {
		t.Fatal("verifier should be a non-trivial value")
	}
}

func TestComputeVerifier_DifferentInputs(t *testing.T) {
	salt := "abcdef0123456789"
	v1 := ComputeVerifier(salt, "alice@example.com", "pass1")
	v2 := ComputeVerifier(salt, "bob@example.com", "pass1")
	v3 := ComputeVerifier(salt, "alice@example.com", "pass2")
	if v1 == v2 {
		t.Fatal("different emails should produce different verifiers")
	}
	if v1 == v3 {
		t.Fatal("different passwords should produce different verifiers")
	}
}

func TestNewServerSession_Valid(t *testing.T) {
	salt, _ := GenerateSalt()
	verifier := ComputeVerifier(salt, "test@example.com", "password")

	sess, bHex, err := NewServerSession(verifier)
	if err != nil {
		t.Fatal(err)
	}
	if sess == nil {
		t.Fatal("session should not be nil")
	}
	if bHex == "" {
		t.Fatal("B should not be empty")
	}
	B := hexToBig(bHex)
	if B.Cmp(nInt) >= 0 {
		t.Fatal("B should be less than N")
	}
	if B.Sign() <= 0 {
		t.Fatal("B should be positive")
	}
}

func TestNewServerSession_InvalidVerifier(t *testing.T) {
	_, _, err := NewServerSession("0")
	if err == nil {
		t.Fatal("expected error for zero verifier")
	}
	_, _, err = NewServerSession("")
	if err == nil {
		t.Fatal("expected error for empty verifier")
	}
}

func TestSetClientPublic_RejectZeroModN(t *testing.T) {
	salt, _ := GenerateSalt()
	verifier := ComputeVerifier(salt, "test@example.com", "password")

	sess, _, _ := NewServerSession(verifier)
	if err := sess.SetClientPublic("0"); err == nil {
		t.Fatal("should reject A=0")
	}

	sess2, _, _ := NewServerSession(verifier)
	if err := sess2.SetClientPublic(nHex); err == nil {
		t.Fatal("should reject A=N")
	}

	sess3, _, _ := NewServerSession(verifier)
	twoN := new(big.Int).Mul(nInt, big.NewInt(2))
	if err := sess3.SetClientPublic(bigToHex(twoN)); err == nil {
		t.Fatal("should reject A=2N")
	}
}

func TestSetClientPublic_AcceptValid(t *testing.T) {
	salt, _ := GenerateSalt()
	verifier := ComputeVerifier(salt, "test@example.com", "password")
	sess, _, _ := NewServerSession(verifier)

	a, _ := randomBig(256)
	A := new(big.Int).Exp(gInt, a, nInt)
	if err := sess.SetClientPublic(bigToHex(A)); err != nil {
		t.Fatalf("should accept valid A: %v", err)
	}
}

// Full SRP-6a round-trip: simulate both client and server sides.
func TestSRPRoundTrip(t *testing.T) {
	email := "alice@haseen.me"
	password := "correct-horse-battery-staple"

	// --- Registration ---
	salt, err := GenerateSalt()
	if err != nil {
		t.Fatal(err)
	}
	verifier := ComputeVerifier(salt, email, password)

	// --- Login: Server creates session ---
	sess, bHex, err := NewServerSession(verifier)
	if err != nil {
		t.Fatal(err)
	}

	// --- Login: Client generates A ---
	a, err := randomBig(256)
	if err != nil {
		t.Fatal(err)
	}
	A := new(big.Int).Exp(gInt, a, nInt)
	aHex := bigToHex(A)

	if err := sess.SetClientPublic(aHex); err != nil {
		t.Fatal(err)
	}

	// --- Client computes session key and M1 ---
	B := hexToBig(bHex)

	// u = H(A || B)
	u := hashBigs(A, B)

	// Client computes x
	inner := sha256Hash([]byte(email + ":" + password))
	saltBytes := hexToBytes(salt)
	combined := append(saltBytes, inner...)
	x := new(big.Int).SetBytes(sha256Hash(combined))

	// S = (B - k * g^x)^(a + u*x) mod N
	gx := new(big.Int).Exp(gInt, x, nInt)
	kgx := new(big.Int).Mul(kInt, gx)
	kgx.Mod(kgx, nInt)
	base := new(big.Int).Sub(B, kgx)
	base.Mod(base, nInt)
	if base.Sign() < 0 {
		base.Add(base, nInt)
	}

	exp := new(big.Int).Mul(u, x)
	exp.Add(exp, a)

	S := new(big.Int).Exp(base, exp, nInt)

	// K = H(S)
	kHash := sha256.Sum256(S.Bytes())
	K := kHash[:]

	// M1 = H(A || B || K)
	M1 := hashBigs(A, B, new(big.Int).SetBytes(K))
	m1Hex := bigToHex(M1)

	// --- Server verifies M1 ---
	m2Hex, valid := sess.VerifyProof(m1Hex)
	if valid == false {
		t.Fatal("server should accept valid M1")
	}
	if m2Hex == "" {
		t.Fatal("M2 should not be empty")
	}

	// --- Client verifies M2 ---
	expectedM2 := hashBigs(A, M1, new(big.Int).SetBytes(K))
	if bigToHex(expectedM2) != m2Hex {
		t.Fatal("M2 mismatch - client and server disagree")
	}
}

// Verify wrong password produces different session key -> invalid M1.
func TestSRPRoundTrip_WrongPassword(t *testing.T) {
	email := "alice@haseen.me"
	salt, _ := GenerateSalt()
	verifier := ComputeVerifier(salt, email, "real-password")

	sess, bHex, _ := NewServerSession(verifier)

	a, _ := randomBig(256)
	A := new(big.Int).Exp(gInt, a, nInt)
	_ = sess.SetClientPublic(bigToHex(A))

	// Client uses WRONG password
	B := hexToBig(bHex)
	u := hashBigs(A, B)
	inner := sha256Hash([]byte(email + ":" + "wrong-password"))
	saltBytes := hexToBytes(salt)
	combined := append(saltBytes, inner...)
	x := new(big.Int).SetBytes(sha256Hash(combined))

	gx := new(big.Int).Exp(gInt, x, nInt)
	kgx := new(big.Int).Mul(kInt, gx)
	kgx.Mod(kgx, nInt)
	base := new(big.Int).Sub(B, kgx)
	base.Mod(base, nInt)
	if base.Sign() < 0 {
		base.Add(base, nInt)
	}
	exp := new(big.Int).Mul(u, x)
	exp.Add(exp, a)
	S := new(big.Int).Exp(base, exp, nInt)

	kHash := sha256.Sum256(S.Bytes())
	K := kHash[:]
	M1 := hashBigs(A, B, new(big.Int).SetBytes(K))

	_, valid := sess.VerifyProof(bigToHex(M1))
	if valid {
		t.Fatal("wrong password should not produce valid M1")
	}
}

func TestVerifyProof_WithoutA(t *testing.T) {
	salt, _ := GenerateSalt()
	verifier := ComputeVerifier(salt, "test@example.com", "password")
	sess, _, _ := NewServerSession(verifier)
	_, valid := sess.VerifyProof("deadbeef")
	if valid {
		t.Fatal("should reject when A is not set")
	}
}
