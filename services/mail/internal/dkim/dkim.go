package dkim

import (
	"crypto"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"encoding/pem"
	"fmt"
	"io"
	"sort"
	"strings"
	"time"
)

var dkimEncryptionKey []byte

func SetEncryptionKey(key []byte) {
	dkimEncryptionKey = make([]byte, len(key))
	copy(dkimEncryptionKey, key)
}

type KeyPair struct {
	PrivateKeyPEM string
	PublicKeyDNS  string
	Selector      string
	EncryptedKey  []byte
	IV            []byte
}

func GenerateKeyPair(selector string, bits int) (*KeyPair, error) {
	privKey, err := rsa.GenerateKey(rand.Reader, bits)
	if err != nil {
		return nil, fmt.Errorf("generate RSA key: %w", err)
	}

	privPEM := pem.EncodeToMemory(&pem.Block{
		Type:  "RSA PRIVATE KEY",
		Bytes: x509.MarshalPKCS1PrivateKey(privKey),
	})

	pubDER, err := x509.MarshalPKIXPublicKey(&privKey.PublicKey)
	if err != nil {
		return nil, fmt.Errorf("marshal public key: %w", err)
	}
	pubB64 := base64.StdEncoding.EncodeToString(pubDER)

	encKey, iv, err := encryptAESGCM(privPEM)
	if err != nil {
		return nil, fmt.Errorf("encrypt private key: %w", err)
	}

	return &KeyPair{
		PrivateKeyPEM: string(privPEM),
		PublicKeyDNS:  pubB64,
		Selector:      selector,
		EncryptedKey:  encKey,
		IV:            iv,
	}, nil
}

func encryptAESGCM(plaintext []byte) (ciphertext, iv []byte, err error) {
	if len(dkimEncryptionKey) == 0 {
		return nil, nil, fmt.Errorf("DKIM encryption key not set")
	}

	block, err := aes.NewCipher(dkimEncryptionKey)
	if err != nil {
		return nil, nil, fmt.Errorf("aes cipher: %w", err)
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return nil, nil, fmt.Errorf("aes-gcm: %w", err)
	}

	nonce := make([]byte, aesGCM.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return nil, nil, fmt.Errorf("generate nonce: %w", err)
	}

	return aesGCM.Seal(nil, nonce, plaintext, nil), nonce, nil
}

func DecryptPrivateKey(encrypted, iv []byte) (*rsa.PrivateKey, error) {
	if len(dkimEncryptionKey) == 0 {
		return nil, fmt.Errorf("DKIM encryption key not set")
	}

	block, err := aes.NewCipher(dkimEncryptionKey)
	if err != nil {
		return nil, fmt.Errorf("aes cipher: %w", err)
	}

	aesGCM, err := cipher.NewGCM(block)
	if err != nil {
		return nil, fmt.Errorf("aes-gcm: %w", err)
	}

	plaintext, err := aesGCM.Open(nil, iv, encrypted, nil)
	if err != nil {
		return nil, fmt.Errorf("decrypt: %w", err)
	}

	pemBlock, _ := pem.Decode(plaintext)
	if pemBlock == nil {
		return nil, fmt.Errorf("invalid PEM data")
	}

	return x509.ParsePKCS1PrivateKey(pemBlock.Bytes)
}

type SignOptions struct {
	PrivateKey *rsa.PrivateKey
	Domain     string
	Selector   string
	Headers    []string
	Body       string
}

func Sign(opts *SignOptions, headerBlock string) (string, error) {
	canonBody := relaxedCanonBody(opts.Body)
	bodyHash := sha256.Sum256([]byte(canonBody))
	bodyHashB64 := base64.StdEncoding.EncodeToString(bodyHash[:])

	timestamp := time.Now().Unix()
	signedHeaders := make([]string, len(opts.Headers))
	copy(signedHeaders, opts.Headers)
	sort.Strings(signedHeaders)

	dkimHeader := fmt.Sprintf(
		"DKIM-Signature: v=1; a=rsa-sha256; c=relaxed/relaxed; d=%s; s=%s; t=%d; bh=%s; h=%s; b=",
		opts.Domain, opts.Selector, timestamp, bodyHashB64,
		strings.Join(signedHeaders, ":"),
	)

	canonHeaders := relaxedCanonHeaders(headerBlock, signedHeaders)
	dataToSign := canonHeaders + relaxedCanonHeader("dkim-signature", dkimHeader[len("DKIM-Signature: "):])

	hash := sha256.Sum256([]byte(dataToSign))
	sig, err := rsa.SignPKCS1v15(rand.Reader, opts.PrivateKey, crypto.SHA256, hash[:])
	if err != nil {
		return "", fmt.Errorf("sign: %w", err)
	}

	sigB64 := base64.StdEncoding.EncodeToString(sig)
	return dkimHeader + sigB64, nil
}

func relaxedCanonBody(body string) string {
	body = strings.ReplaceAll(body, "\r\n", "\n")
	lines := strings.Split(body, "\n")
	var result []string
	for _, line := range lines {
		line = strings.TrimRight(line, " \t")
		result = append(result, line)
	}
	body = strings.Join(result, "\r\n")
	for strings.HasSuffix(body, "\r\n\r\n") {
		body = body[:len(body)-2]
	}
	if !strings.HasSuffix(body, "\r\n") {
		body += "\r\n"
	}
	return body
}

func relaxedCanonHeaders(headerBlock string, signedHeaders []string) string {
	headerMap := parseHeaders(headerBlock)
	var result strings.Builder
	for _, h := range signedHeaders {
		hLower := strings.ToLower(h)
		if val, ok := headerMap[hLower]; ok {
			result.WriteString(relaxedCanonHeader(hLower, val))
			result.WriteString("\r\n")
		}
	}
	return result.String()
}

func relaxedCanonHeader(name, value string) string {
	value = strings.Join(strings.Fields(value), " ")
	return strings.ToLower(name) + ":" + value
}

func parseHeaders(block string) map[string]string {
	result := make(map[string]string)
	block = strings.ReplaceAll(block, "\r\n", "\n")
	lines := strings.Split(block, "\n")
	var currentKey, currentVal string
	for _, line := range lines {
		if line == "" {
			break
		}
		if len(line) > 0 && (line[0] == ' ' || line[0] == '\t') {
			currentVal += " " + strings.TrimSpace(line)
			continue
		}
		if currentKey != "" {
			result[strings.ToLower(currentKey)] = currentVal
		}
		parts := strings.SplitN(line, ":", 2)
		if len(parts) != 2 {
			continue
		}
		currentKey = strings.TrimSpace(parts[0])
		currentVal = strings.TrimSpace(parts[1])
	}
	if currentKey != "" {
		result[strings.ToLower(currentKey)] = currentVal
	}
	return result
}
