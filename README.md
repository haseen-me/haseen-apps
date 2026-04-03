# Haseen

End-to-end encrypted productivity suite — mail, drive, calendar, and accounts — built on zero-knowledge architecture.

## Architecture

```
haseen-apps/
├── apps/                 # Frontend applications (React + Vite)
│   ├── web/              # Marketing site         :3000
│   ├── mail/             # Encrypted email client  :3001
│   ├── drive/            # Encrypted file storage  :3002
│   ├── accounts/         # Auth & account settings :3003
│   ├── calendar/         # Encrypted calendar      :3004
│   └── ui-docs/          # Component playground    :3010
├── packages/             # Shared TypeScript packages
│   ├── crypto/           # NaCl encryption, SRP-6a, KDF, envelopes
│   ├── api-client/       # Typed HTTP client for Go backend
│   ├── shared/           # Shared utilities, ErrorBoundary
│   └── config/           # Shared Vite/TS config
├── services/             # Go backend microservices
│   ├── gateway/          # API gateway + routing   :8080
│   ├── auth/             # SRP auth, MFA, sessions :8081
│   ├── mail/             # Mail storage & delivery :8082
│   ├── drive/            # File storage            :8083
│   ├── keyserver/        # Public key directory    :8084
│   └── calendar/         # Calendar events         :8085
├── proto/                # Protobuf schemas (buf v2)
├── migrations/           # PostgreSQL migrations
└── deploy/               # Docker & infra config
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 6, TypeScript 5.8, Zustand 5 |
| Backend | Go 1.23, chi v5, pgx v5, zerolog |
| Crypto | TweetNaCl (X25519, Ed25519, XSalsa20-Poly1305) |
| Auth | SRP-6a (RFC 5054), PBKDF2-SHA256 (600k iterations), TOTP MFA |
| Database | PostgreSQL 16 |
| Infra | Docker Compose, Turborepo, buf |

## Getting Started

### Prerequisites

- Node.js 20+
- Go 1.23+
- PostgreSQL 16+
- Docker & Docker Compose (optional)

### Development

```bash
# Install dependencies
npm install

# Start all frontend apps
npx turbo dev

# Build everything
npx turbo build

# Run tests
npx turbo test

# Start backend with Docker
docker compose up -d
```

### Environment

Copy `.env.example` to `.env` and fill in:

```
DATABASE_URL=postgres://haseen:haseen@localhost:5432/haseen
JWT_SECRET=your-secret
```

### Backend Services

```bash
# Run a single service
cd services/auth && go run .

# Run all services
docker compose up -d

# Run database migrations
psql $DATABASE_URL < migrations/001_auth.sql
```

## Security Model

- **Zero-knowledge**: Server never sees plaintext data or private keys
- **E2E encryption**: NaCl box (X25519 + XSalsa20-Poly1305) for asymmetric, secretbox for symmetric
- **SRP-6a**: Password never leaves the client; authentication via zero-knowledge proof
- **Key derivation**: PBKDF2-SHA256 with 600k iterations
- **Sealed envelopes**: Per-message session keys encrypted to each recipient's public key, signed by sender

## License

Private — all rights reserved.
