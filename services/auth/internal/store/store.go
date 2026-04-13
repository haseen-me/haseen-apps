package store

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5/pgxpool"
)

var ErrNotFound = errors.New("not found")

type Store struct {
	DB *pgxpool.Pool
}

// DefaultQuotas are used when provisioning a new user.
// These are intentionally conservative and can be managed via the admin panel later.
const (
	DefaultMailQuotaBytes  int64 = 5 * 1024 * 1024 * 1024  // 5 GiB
	DefaultDriveQuotaBytes int64 = 10 * 1024 * 1024 * 1024 // 10 GiB
)

func New(ctx context.Context, databaseURL string) (*Store, error) {
	cfg, err := pgxpool.ParseConfig(databaseURL)
	if err != nil {
		return nil, err
	}
	pool, err := pgxpool.NewWithConfig(ctx, cfg)
	if err != nil {
		return nil, err
	}
	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, err
	}
	return &Store{DB: pool}, nil
}

func (s *Store) Close() {
	s.DB.Close()
}

func (s *Store) Ping(ctx context.Context) error {
	return s.DB.Ping(ctx)
}
