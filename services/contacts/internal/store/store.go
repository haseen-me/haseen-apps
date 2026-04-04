package store

import (
"context"
"errors"
"fmt"

"github.com/jackc/pgx/v5/pgxpool"
)

var ErrNotFound = errors.New("not found")

type Store struct {
DB *pgxpool.Pool
}

func New(ctx context.Context, databaseURL string) (*Store, error) {
cfg, err := pgxpool.ParseConfig(databaseURL)
if err != nil {
return nil, fmt.Errorf("parse db config: %w", err)
}
cfg.MaxConns = 10
pool, err := pgxpool.NewWithConfig(ctx, cfg)
if err != nil {
return nil, fmt.Errorf("connect to db: %w", err)
}
if err := pool.Ping(ctx); err != nil {
pool.Close()
return nil, fmt.Errorf("ping db: %w", err)
}
return &Store{DB: pool}, nil
}

func (s *Store) Close() {
s.DB.Close()
}
