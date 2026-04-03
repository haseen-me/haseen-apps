// Package srp implements the server side of SRP-6a (Secure Remote Password).
//
// The protocol allows a client to authenticate to a server without
// transmitting the password. The server stores only a verifier derived
// from the password, not the password itself.
//
// Wire format: all big-integer values are transmitted as hex strings.
//
// Reference: RFC 5054, RFC 2945, http://srp.stanford.edu/design.html
package srp

import (
	"crypto/rand"
	"crypto/sha256"
	"errors"
	"math/big"
)

// Group parameters: 2048-bit group from RFC 5054 Appendix A.
var (
	nHex = "AC6BDB41324A9A9BF166DE5E1389582FAF72B6651987EE07FC3192943DB56050A37329CBB4" +
		"A099ED8193E0757767A13DD52312AB4B03310DCD7F48A9DA04FD50E8083969EDB767B0CF60" +
		"95179A163AB3661A05FBD5FAAAE82918A9962F0B93B855F97993EC975EEAA80D740ADBF4FF" +
		"747359D041D5C33EA71D281E446B14773BCA97B43A23FB801676BD207A436C6481F1D2B907" +
		"8717461A5B9D32E688F87748544523B524B0D57D5EA77A2775D2ECFA032CFBDBF52FB37861" +
		"60279004E57AE6AF874E7303CE53299CCC041C7BC308D82A5698F3A8D0C38271AE35F8E9DB" +
		"FBB694B5C803D89F7AE435DE236D525F54759B65E372FCD68EF20FA7111F9E4AFF73"

	gInt = big.NewInt(2)
	nInt = hexToBig(nHex)

	// k = H(N || PAD(g))
	kInt = computeK(nInt, gInt)
)

// ServerSession holds server-side SRP state for a single login attempt.
type ServerSession struct {
	verifier *big.Int // v
	b        *big.Int // server secret ephemeral
	B        *big.Int // server public ephemeral (sent to client)
	A        *big.Int // client public ephemeral (received from client)
}

// NewServerSession creates a server session from the stored verifier (hex).
// Returns the session and the server's public ephemeral B (hex string).
func NewServerSession(verifierHex string) (*ServerSession, string, error) {
	v := hexToBig(verifierHex)
	if v.Sign() <= 0 {
		return nil, "", errors.New("invalid verifier")
	}

	// Generate random b (server secret ephemeral)
	b, err := randomBig(256)
	if err != nil {
		return nil, "", err
	}

	// B = k*v + g^b mod N
	kv := new(big.Int).Mul(kInt, v)
	gb := new(big.Int).Exp(gInt, b, nInt)
	B := new(big.Int).Add(kv, gb)
	B.Mod(B, nInt)

	if B.Sign() == 0 {
		return nil, "", errors.New("B is zero, try again")
	}

	sess := &ServerSession{
		verifier: v,
		b:        b,
		B:        B,
	}
	return sess, bigToHex(B), nil
}

// SetClientPublic stores the client's public ephemeral A. Must be called before VerifyProof.
func (s *ServerSession) SetClientPublic(aHex string) error {
	A := hexToBig(aHex)
	// Safety check: A mod N must not be zero
	if new(big.Int).Mod(A, nInt).Sign() == 0 {
		return errors.New("invalid client public value A")
	}
	s.A = A
	return nil
}

// VerifyProof verifies the client proof M1 and returns M2 (server proof).
// M1 = H(H(N) XOR H(g) || H(email) || salt || A || B || S_key)
// For simplicity we use the common shortcut: M1 = H(A || B || K), M2 = H(A || M1 || K)
func (s *ServerSession) VerifyProof(m1Hex string) (string, bool) {
	if s.A == nil {
		return "", false
	}

	K := s.computeSessionKey()

	// Compute expected M1 = H(A || B || K)
	expectedM1 := hashBigs(s.A, s.B, new(big.Int).SetBytes(K))
	clientM1 := hexToBig(m1Hex)

	if expectedM1.Cmp(clientM1) != 0 {
		return "", false
	}

	// M2 = H(A || M1 || K)
	M2 := hashBigs(s.A, clientM1, new(big.Int).SetBytes(K))
	return bigToHex(M2), true
}

// computeSessionKey computes the shared session key K = H(S).
func (s *ServerSession) computeSessionKey() []byte {
	// u = H(A || B)
	u := hashBigs(s.A, s.B)

	// S = (A * v^u)^b mod N
	vu := new(big.Int).Exp(s.verifier, u, nInt)
	avu := new(big.Int).Mul(s.A, vu)
	avu.Mod(avu, nInt)
	S := new(big.Int).Exp(avu, s.b, nInt)

	// K = H(S)
	h := sha256.Sum256(S.Bytes())
	return h[:]
}

// ComputeVerifier is a helper for registration: given email+password+salt,
// compute x = H(salt || H(email:password)), v = g^x mod N
func ComputeVerifier(saltHex, email, password string) string {
	// inner = H(email:password)
	inner := sha256Hash([]byte(email + ":" + password))
	// x = H(salt || inner)
	salt := hexToBytes(saltHex)
	combined := append(salt, inner...)
	x := new(big.Int).SetBytes(sha256Hash(combined))

	v := new(big.Int).Exp(gInt, x, nInt)
	return bigToHex(v)
}

// GenerateSalt generates a random 16-byte salt, returned as hex.
func GenerateSalt() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return bigToHex(new(big.Int).SetBytes(b)), nil
}

// --- helpers ---

func computeK(N, g *big.Int) *big.Int {
	return hashBigs(N, pad(g, len(N.Bytes())))
}

func pad(n *big.Int, length int) *big.Int {
	b := n.Bytes()
	if len(b) >= length {
		return n
	}
	padded := make([]byte, length)
	copy(padded[length-len(b):], b)
	return new(big.Int).SetBytes(padded)
}

func hashBigs(vals ...*big.Int) *big.Int {
	h := sha256.New()
	for _, v := range vals {
		h.Write(v.Bytes())
	}
	return new(big.Int).SetBytes(h.Sum(nil))
}

func sha256Hash(data []byte) []byte {
	h := sha256.Sum256(data)
	return h[:]
}

func hexToBig(s string) *big.Int {
	n := new(big.Int)
	n.SetString(s, 16)
	return n
}

func hexToBytes(s string) []byte {
	return hexToBig(s).Bytes()
}

func bigToHex(n *big.Int) string {
	return n.Text(16)
}

func randomBig(bits int) (*big.Int, error) {
	b := make([]byte, bits/8)
	if _, err := rand.Read(b); err != nil {
		return nil, err
	}
	return new(big.Int).SetBytes(b), nil
}
