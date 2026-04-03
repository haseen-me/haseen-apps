package blob

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"io"
	"os"
	"path/filepath"
	"time"
)

// Storage handles local filesystem blob storage for encrypted files.
type Storage struct {
	BaseDir string
}

func NewStorage(baseDir string) (*Storage, error) {
	if err := os.MkdirAll(baseDir, 0o750); err != nil {
		return nil, fmt.Errorf("create blob dir: %w", err)
	}
	return &Storage{BaseDir: baseDir}, nil
}

// Store writes file data to a content-addressable path and returns the relative blob path.
func (s *Storage) Store(data io.Reader) (string, int64, error) {
	// Generate a unique path: YYYY/MM/DD/<random-hex>
	now := time.Now()
	dir := filepath.Join(s.BaseDir, now.Format("2006"), now.Format("01"), now.Format("02"))
	if err := os.MkdirAll(dir, 0o750); err != nil {
		return "", 0, fmt.Errorf("create blob subdir: %w", err)
	}

	id := randomHex(16)
	relPath := filepath.Join(now.Format("2006"), now.Format("01"), now.Format("02"), id)
	absPath := filepath.Join(s.BaseDir, relPath)

	f, err := os.Create(absPath)
	if err != nil {
		return "", 0, fmt.Errorf("create blob file: %w", err)
	}
	defer f.Close()

	n, err := io.Copy(f, data)
	if err != nil {
		os.Remove(absPath)
		return "", 0, fmt.Errorf("write blob: %w", err)
	}
	return relPath, n, nil
}

// Open returns a reader for the blob at the given path.
func (s *Storage) Open(blobPath string) (io.ReadCloser, error) {
	absPath := filepath.Join(s.BaseDir, blobPath)
	f, err := os.Open(absPath)
	if err != nil {
		return nil, fmt.Errorf("open blob: %w", err)
	}
	return f, nil
}

// Delete removes a blob file.
func (s *Storage) Delete(blobPath string) error {
	absPath := filepath.Join(s.BaseDir, blobPath)
	return os.Remove(absPath)
}

// Size returns the size of a blob.
func (s *Storage) Size(blobPath string) (int64, error) {
	absPath := filepath.Join(s.BaseDir, blobPath)
	info, err := os.Stat(absPath)
	if err != nil {
		return 0, err
	}
	return info.Size(), nil
}

func randomHex(n int) string {
	b := make([]byte, n)
	rand.Read(b)
	return hex.EncodeToString(b)
}
