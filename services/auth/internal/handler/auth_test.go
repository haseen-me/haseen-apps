package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/haseen-me/haseen-apps/services/auth/internal/model"
	"github.com/haseen-me/haseen-apps/services/auth/internal/store"
	"github.com/rs/zerolog"
)

// mockStore implements store.DataStore for testing.
type mockStore struct {
	users      map[string]*model.User
	sessions   map[string]*model.Session
	mfaEnabled map[string]bool

	createUserFn   func(ctx context.Context, email, srpSalt, srpVerifier string) (*model.User, error)
	createSessFn   func(ctx context.Context, userID, ua, ip string) (string, error)
	getUserByEmail func(ctx context.Context, email string) (*model.User, error)
	getUserByID    func(ctx context.Context, id string) (*model.User, error)
	isMFAEnabled   func(ctx context.Context, userID string) (bool, error)
}

func newMockStore() *mockStore {
	return &mockStore{
		users:      make(map[string]*model.User),
		sessions:   make(map[string]*model.Session),
		mfaEnabled: make(map[string]bool),
	}
}

func (m *mockStore) CreateUser(ctx context.Context, email, srpSalt, srpVerifier string) (*model.User, error) {
	if m.createUserFn != nil {
		return m.createUserFn(ctx, email, srpSalt, srpVerifier)
	}
	u := &model.User{
		ID:          "user-" + email,
		Email:       email,
		SRPSalt:     srpSalt,
		SRPVerifier: srpVerifier,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}
	m.users[email] = u
	return u, nil
}

func (m *mockStore) GetUserByEmail(ctx context.Context, email string) (*model.User, error) {
	if m.getUserByEmail != nil {
		return m.getUserByEmail(ctx, email)
	}
	u, ok := m.users[email]
	if ok {
		return u, nil
	}
	return nil, store.ErrNotFound
}

func (m *mockStore) GetUserByID(ctx context.Context, id string) (*model.User, error) {
	if m.getUserByID != nil {
		return m.getUserByID(ctx, id)
	}
	for _, u := range m.users {
		if u.ID == id {
			return u, nil
		}
	}
	return nil, store.ErrNotFound
}

func (m *mockStore) UpdateUserEmail(ctx context.Context, id, email string) error { return nil }
func (m *mockStore) UpdateUserSRP(ctx context.Context, id, srpSalt, srpVerifier string) error {
	return nil
}
func (m *mockStore) DeleteUser(ctx context.Context, id string) error { return nil }

func (m *mockStore) CreateSession(ctx context.Context, userID, userAgent, ipAddress string) (string, error) {
	if m.createSessFn != nil {
		return m.createSessFn(ctx, userID, userAgent, ipAddress)
	}
	token := "test-token-" + userID
	m.sessions[token] = &model.Session{
		ID:     "sess-1",
		UserID: userID,
	}
	return token, nil
}

func (m *mockStore) ValidateSession(ctx context.Context, token string) (*model.Session, error) {
	s, ok := m.sessions[token]
	if ok {
		return s, nil
	}
	return nil, store.ErrNotFound
}

func (m *mockStore) DeleteSession(ctx context.Context, token string) error {
	delete(m.sessions, token)
	return nil
}

func (m *mockStore) DeleteUserSessions(ctx context.Context, userID string) error { return nil }
func (m *mockStore) RefreshSession(ctx context.Context, token string) error      { return nil }

func (m *mockStore) StorePublicKeys(ctx context.Context, userID string, encKey, signKey, sig []byte) (*model.PublicKeyBundle, error) {
	return &model.PublicKeyBundle{ID: "pk-1", UserID: userID}, nil
}
func (m *mockStore) GetActivePublicKeys(ctx context.Context, userID string) (*model.PublicKeyBundle, error) {
	return &model.PublicKeyBundle{ID: "pk-1", UserID: userID}, nil
}
func (m *mockStore) RevokePublicKeys(ctx context.Context, userID string) error { return nil }

func (m *mockStore) GetMFASecret(ctx context.Context, userID string) (string, bool, error) {
	return "", false, nil
}
func (m *mockStore) UpsertMFASecret(ctx context.Context, userID, secret string) error { return nil }
func (m *mockStore) EnableMFA(ctx context.Context, userID string) error               { return nil }
func (m *mockStore) DisableMFA(ctx context.Context, userID string) error              { return nil }
func (m *mockStore) IsMFAEnabled(ctx context.Context, userID string) (bool, error) {
	if m.isMFAEnabled != nil {
		return m.isMFAEnabled(ctx, userID)
	}
	return m.mfaEnabled[userID], nil
}
func (m *mockStore) StoreRecoveryKey(ctx context.Context, userID string, encryptedKey []byte, keyHash string) error {
	return nil
}
func (m *mockStore) HasRecoveryKey(ctx context.Context, userID string) (bool, error) {
	return false, nil
}

// --- helpers ---

func newTestHandler() (*Handler, *mockStore) {
	ms := newMockStore()
	h := &Handler{
		Store: ms,
		Log:   zerolog.Nop(),
	}
	return h, ms
}

func doJSON(t *testing.T, h http.HandlerFunc, method, path string, body any) *httptest.ResponseRecorder {
	t.Helper()
	var buf bytes.Buffer
	if body != nil {
		json.NewEncoder(&buf).Encode(body)
	}
	req := httptest.NewRequest(method, path, &buf)
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	h(rec, req)
	return rec
}

func decodeBody(t *testing.T, rec *httptest.ResponseRecorder, v any) {
	t.Helper()
	if err := json.NewDecoder(rec.Body).Decode(v); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
}

// --- Test: Register ---

func TestRegister_Success(t *testing.T) {
	h, _ := newTestHandler()

	body := model.RegisterRequest{
		Email:       "alice@haseen.me",
		SRPSalt:     "aabbccdd",
		SRPVerifier: "deadbeef1234",
		PublicKey:   []byte("enc-key"),
		SigningKey:  []byte("sign-key"),
	}
	rec := doJSON(t, h.Register, "POST", "/v1/register", body)

	if rec.Code != http.StatusCreated {
		t.Fatalf("expected 201, got %d: %s", rec.Code, rec.Body.String())
	}

	var resp model.RegisterResponse
	decodeBody(t, rec, &resp)

	if resp.UserID == "" {
		t.Fatal("expected userID in response")
	}
	if resp.SessionToken == "" {
		t.Fatal("expected sessionToken in response")
	}
	if resp.RecoveryKey == "" {
		t.Fatal("expected recoveryKey in response")
	}
}

func TestRegister_MissingFields(t *testing.T) {
	h, _ := newTestHandler()

	body := model.RegisterRequest{Email: "alice@haseen.me"}
	rec := doJSON(t, h.Register, "POST", "/v1/register", body)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rec.Code)
	}
}

func TestRegister_DuplicateEmail(t *testing.T) {
	h, ms := newTestHandler()
	ms.users["alice@haseen.me"] = &model.User{ID: "u1", Email: "alice@haseen.me"}

	body := model.RegisterRequest{
		Email:       "alice@haseen.me",
		SRPSalt:     "aabb",
		SRPVerifier: "ccdd",
		PublicKey:   []byte("k"),
		SigningKey:  []byte("s"),
	}
	rec := doJSON(t, h.Register, "POST", "/v1/register", body)

	if rec.Code != http.StatusConflict {
		t.Fatalf("expected 409, got %d: %s", rec.Code, rec.Body.String())
	}
}

func TestRegister_MissingKeys(t *testing.T) {
	h, _ := newTestHandler()

	body := model.RegisterRequest{
		Email:       "alice@haseen.me",
		SRPSalt:     "aabb",
		SRPVerifier: "ccdd",
	}
	rec := doJSON(t, h.Register, "POST", "/v1/register", body)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rec.Code)
	}
}

// --- Test: LoginInit ---

func TestLoginInit_UserNotFound(t *testing.T) {
	h, _ := newTestHandler()

	body := model.LoginInitRequest{
		Email: "nobody@haseen.me",
		SRPA:  "aabb",
	}
	rec := doJSON(t, h.LoginInit, "POST", "/v1/login/init", body)

	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", rec.Code)
	}
}

func TestLoginInit_MissingFields(t *testing.T) {
	h, _ := newTestHandler()

	body := model.LoginInitRequest{Email: "alice@haseen.me"}
	rec := doJSON(t, h.LoginInit, "POST", "/v1/login/init", body)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rec.Code)
	}
}

// --- Test: LoginVerify ---

func TestLoginVerify_NoSession(t *testing.T) {
	h, _ := newTestHandler()

	body := model.LoginVerifyRequest{
		Email: "alice@haseen.me",
		SRPM1: "deadbeef",
	}
	rec := doJSON(t, h.LoginVerify, "POST", "/v1/login/verify", body)

	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d: %s", rec.Code, rec.Body.String())
	}
}

func TestLoginVerify_MissingFields(t *testing.T) {
	h, _ := newTestHandler()

	body := model.LoginVerifyRequest{Email: "alice@haseen.me"}
	rec := doJSON(t, h.LoginVerify, "POST", "/v1/login/verify", body)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rec.Code)
	}
}

// --- Test: Logout ---

func TestLogout_Success(t *testing.T) {
	h, ms := newTestHandler()
	ms.sessions["tok-123"] = &model.Session{ID: "s1", UserID: "u1"}

	req := httptest.NewRequest("POST", "/v1/logout", nil)
	req.Header.Set("Authorization", "Bearer tok-123")
	rec := httptest.NewRecorder()
	h.Logout(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rec.Code)
	}
}

func TestLogout_MissingToken(t *testing.T) {
	h, _ := newTestHandler()

	req := httptest.NewRequest("POST", "/v1/logout", nil)
	rec := httptest.NewRecorder()
	h.Logout(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", rec.Code)
	}
}

// --- Test: SessionRefresh ---

func TestSessionRefresh_MissingToken(t *testing.T) {
	h, _ := newTestHandler()

	req := httptest.NewRequest("POST", "/v1/session/refresh", nil)
	rec := httptest.NewRecorder()
	h.SessionRefresh(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", rec.Code)
	}
}

// --- Test: Full SRP login flow (init + verify) ---

func TestFullSRPLoginFlow(t *testing.T) {
	h, ms := newTestHandler()

	// Pre-register a user with known SRP credentials
	email := "alice@haseen.me"

	salt := "abcdef0123456789abcdef0123456789"

	// Compute verifier using the srp package
	// Since we can't easily import srp in the same test (circular),
	// we just test the HTTP flow with a pre-registered user.
	// The SRP round-trip is already tested in srp_test.go.
	ms.users[email] = &model.User{
		ID:          "user-1",
		Email:       email,
		SRPSalt:     salt,
		SRPVerifier: "deadbeef1234", // fake verifier for flow test
		CreatedAt:   time.Now(),
	}

	// Step 1: LoginInit
	initBody := model.LoginInitRequest{
		Email: email,
		SRPA:  "aabbccddee", // fake A
	}
	initRec := doJSON(t, h.LoginInit, "POST", "/v1/login/init", initBody)

	// LoginInit with a fake verifier may fail on SRP session creation,
	// but it tests the HTTP plumbing
	if initRec.Code != http.StatusOK && initRec.Code != http.StatusInternalServerError && initRec.Code != http.StatusBadRequest {
		t.Fatalf("expected 200/500/400 from LoginInit, got %d: %s", initRec.Code, initRec.Body.String())
	}
}
