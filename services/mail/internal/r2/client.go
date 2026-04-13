package r2

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"net/http"
	"sort"
	"strings"
	"time"
)

type Client struct {
	AccountID   string
	AccessKeyID string
	SecretKey   string
	Bucket      string
	Endpoint    string
	httpClient  *http.Client
}

func NewClient(accountID, accessKeyID, secretKey, bucket string) *Client {
	endpoint := fmt.Sprintf("https://%s.r2.cloudflarestorage.com", accountID)
	return &Client{
		AccountID:   accountID,
		AccessKeyID: accessKeyID,
		SecretKey:   secretKey,
		Bucket:      bucket,
		Endpoint:    endpoint,
		httpClient:  &http.Client{Timeout: 60 * time.Second},
	}
}

func (c *Client) Upload(ctx context.Context, key string, data io.Reader, contentType string, size int64) error {
	body, err := io.ReadAll(data)
	if err != nil {
		return fmt.Errorf("read body: %w", err)
	}

	url := fmt.Sprintf("%s/%s/%s", c.Endpoint, c.Bucket, key)
	req, err := http.NewRequestWithContext(ctx, "PUT", url, bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("create request: %w", err)
	}

	req.Header.Set("Content-Type", contentType)
	now := time.Now().UTC()
	req.Header.Set("x-amz-date", now.Format("20060102T150405Z"))
	req.Header.Set("x-amz-content-sha256", hashSHA256(body))
	c.signRequest(req, body, now)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("upload request: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		respBody, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("R2 upload failed (HTTP %d): %s", resp.StatusCode, string(respBody))
	}
	return nil
}

func (c *Client) Download(ctx context.Context, key string) (io.ReadCloser, string, error) {
	url := fmt.Sprintf("%s/%s/%s", c.Endpoint, c.Bucket, key)
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, "", fmt.Errorf("create request: %w", err)
	}

	now := time.Now().UTC()
	req.Header.Set("x-amz-date", now.Format("20060102T150405Z"))
	req.Header.Set("x-amz-content-sha256", "UNSIGNED-PAYLOAD")
	c.signRequest(req, nil, now)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, "", fmt.Errorf("download request: %w", err)
	}

	if resp.StatusCode >= 400 {
		resp.Body.Close()
		return nil, "", fmt.Errorf("R2 download failed (HTTP %d)", resp.StatusCode)
	}

	return resp.Body, resp.Header.Get("Content-Type"), nil
}

func (c *Client) Delete(ctx context.Context, key string) error {
	url := fmt.Sprintf("%s/%s/%s", c.Endpoint, c.Bucket, key)
	req, err := http.NewRequestWithContext(ctx, "DELETE", url, nil)
	if err != nil {
		return fmt.Errorf("create request: %w", err)
	}

	now := time.Now().UTC()
	req.Header.Set("x-amz-date", now.Format("20060102T150405Z"))
	req.Header.Set("x-amz-content-sha256", "UNSIGNED-PAYLOAD")
	c.signRequest(req, nil, now)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("delete request: %w", err)
	}
	defer resp.Body.Close()
	return nil
}

func (c *Client) GenerateKey(prefix, filename string) string {
	ts := time.Now().UnixNano()
	return fmt.Sprintf("%s/%d/%s", prefix, ts, filename)
}

// AWS Signature V4 implementation for R2 compatibility
func (c *Client) signRequest(req *http.Request, payload []byte, t time.Time) {
	region := "auto"
	service := "s3"
	dateStamp := t.Format("20060102")
	amzDate := t.Format("20060102T150405Z")

	req.Header.Set("Host", req.URL.Host)

	var signedHeaders []string
	for key := range req.Header {
		signedHeaders = append(signedHeaders, strings.ToLower(key))
	}
	sort.Strings(signedHeaders)
	signedHeadersStr := strings.Join(signedHeaders, ";")

	var canonicalHeaders strings.Builder
	for _, key := range signedHeaders {
		canonicalHeaders.WriteString(key + ":" + strings.TrimSpace(req.Header.Get(key)) + "\n")
	}

	payloadHash := "UNSIGNED-PAYLOAD"
	if payload != nil {
		payloadHash = hashSHA256(payload)
	}

	canonicalRequest := strings.Join([]string{
		req.Method,
		req.URL.Path,
		req.URL.RawQuery,
		canonicalHeaders.String(),
		signedHeadersStr,
		payloadHash,
	}, "\n")

	credentialScope := strings.Join([]string{dateStamp, region, service, "aws4_request"}, "/")
	stringToSign := strings.Join([]string{
		"AWS4-HMAC-SHA256",
		amzDate,
		credentialScope,
		hashSHA256([]byte(canonicalRequest)),
	}, "\n")

	signingKey := deriveSigningKey(c.SecretKey, dateStamp, region, service)
	signature := hex.EncodeToString(hmacSHA256(signingKey, []byte(stringToSign)))

	authHeader := fmt.Sprintf(
		"AWS4-HMAC-SHA256 Credential=%s/%s, SignedHeaders=%s, Signature=%s",
		c.AccessKeyID, credentialScope, signedHeadersStr, signature,
	)
	req.Header.Set("Authorization", authHeader)
}

func hashSHA256(data []byte) string {
	h := sha256.Sum256(data)
	return hex.EncodeToString(h[:])
}

func hmacSHA256(key, data []byte) []byte {
	h := hmac.New(sha256.New, key)
	h.Write(data)
	return h.Sum(nil)
}

func deriveSigningKey(secret, dateStamp, region, service string) []byte {
	kDate := hmacSHA256([]byte("AWS4"+secret), []byte(dateStamp))
	kRegion := hmacSHA256(kDate, []byte(region))
	kService := hmacSHA256(kRegion, []byte(service))
	return hmacSHA256(kService, []byte("aws4_request"))
}
