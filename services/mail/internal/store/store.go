package store

import (
	"context"
	"errors"
	"fmt"
	"net/mail"
	"strings"

	"github.com/haseen-me/haseen-apps/services/mail/internal/model"
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
	cfg.MaxConns = 20
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

func (s *Store) Close() { s.DB.Close() }

func ParseAddress(raw string) model.EmailAddress {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return model.EmailAddress{}
	}
	addr, err := mail.ParseAddress(raw)
	if err != nil {
		return model.EmailAddress{Address: raw}
	}
	return model.EmailAddress{Name: addr.Name, Address: addr.Address}
}

func FormatAddress(ea model.EmailAddress) string {
	if ea.Name == "" {
		return ea.Address
	}
	return fmt.Sprintf("%s <%s>", ea.Name, ea.Address)
}

func ParseAddresses(raw []string) []model.EmailAddress {
	out := make([]model.EmailAddress, 0, len(raw))
	for _, r := range raw {
		if r = strings.TrimSpace(r); r != "" {
			out = append(out, ParseAddress(r))
		}
	}
	return out
}

func FormatAddresses(addrs []model.EmailAddress) []string {
	out := make([]string, len(addrs))
	for i, a := range addrs {
		out[i] = FormatAddress(a)
	}
	return out
}
