# CLAUDE.md — Haseen Apps

> Context file for AI assistants working on this codebase.

## Project

**Haseen** is a privacy-first, end-to-end encrypted productivity suite (mail, drive, calendar).
This is a **closed-source, proprietary** product. Do not expose internal architecture or implementation details publicly.

## Architecture

```
haseen-apps/
├── apps/                   # React 19 + Vite 6 SPAs
│   ├── web/                # haseen.me — Landing/marketing (port 3000)
│   ├── mail/               # haseen.me/mail — E2E encrypted email (port 3001)
│   ├── drive/              # haseen.me/drive — Encrypted storage (port 3002)
│   ├── accounts/           # haseen.me/accounts — Auth & settings (port 3003)
│   └── ui-docs/            # haseen.me/ui — UI component docs site (port 3010)
├── services/               # Go 1.23 microservices
│   ├── gateway/            # API gateway, routing, CORS, rate limiting (port 8080)
│   ├── auth/               # SRP auth, sessions, MFA, key mgmt (port 8081)
│   ├── mail/               # SMTP in/out, encrypted message storage (port 8082)
│   ├── drive/              # File upload/download, encrypted blob storage (port 8083)
│   └── keyserver/          # Public key directory, key exchange (port 8084)
├── packages/               # Shared TypeScript packages
│   ├── crypto/             # Client-side E2E encryption (NaCl/TweetNaCl)
│   ├── api-client/         # Typed HTTP client for Go services
│   ├── config/             # Shared Vite, TS configs
│   └── shared/             # Types, constants, formatters, validators
├── proto/                  # Protocol Buffer definitions (Go + TS wire format)
├── migrations/             # PostgreSQL migrations (ordered, up/down pairs)
├── deploy/                 # Dockerfiles for each Go service
├── docker-compose.yml      # Local development stack
├── go.work                 # Go workspace (links all services)
├── turbo.json              # Turborepo task orchestration
└── package.json            # npm workspaces (apps/*, packages/*)
```

## Tech Stack

| Layer       | Technology                                    |
|-------------|-----------------------------------------------|
| Frontend    | React 19, Vite 6, TypeScript 5.8, Zustand 5  |
| UI Library  | `@haseen-me/ui` (external npm, brand #2db8af) |
| Backend     | Go 1.23, chi router, zerolog                  |
| Database    | PostgreSQL 16                                 |
| Cache       | Redis 7                                       |
| Crypto      | NaCl (TweetNaCl), X25519, Ed25519, SRP        |
| Protobuf    | Shared wire format between Go and TypeScript   |
| Monorepo    | Turborepo 2.4, npm workspaces                 |
| Deploy      | Docker, multi-stage Go builds                 |

## Key Design Principles

1. **Zero-knowledge architecture**: Server never sees plaintext. All encryption/decryption is client-side.
2. **SRP authentication**: No passwords transmitted. Server stores only SRP verifier.
3. **Per-message session keys**: Each email/file uses a unique symmetric key, encrypted per-recipient.
4. **Key rotation**: Users can rotate encryption keys without losing access to old data.
5. **Minimal trust**: Even a compromised server cannot read user data.

## Encryption Flow (Mail)

1. Sender generates a random session key (NaCl secretbox key)
2. Message body + subject encrypted with session key (symmetric)
3. Session key encrypted with each recipient's X25519 public key (asymmetric)
4. Entire envelope signed with sender's Ed25519 signing key
5. Server stores encrypted envelope — never sees plaintext
6. Recipient decrypts session key with their private key, then decrypts message

## Commands

```bash
# Frontend development
npm install              # Install all workspace dependencies
npx turbo dev            # Start all apps in dev mode
npx turbo build          # Build all apps and packages
npx turbo typecheck      # Type-check everything

# Single app
cd apps/web && npm run dev       # Just the website (port 3000)
cd apps/mail && npm run dev      # Just mail app (port 3001)

# Go services
cd services/gateway && go run .  # Start gateway (port 8080)
cd services/auth && go run .     # Start auth service (port 8081)

# Docker (full stack)
docker compose up -d             # Start postgres + redis + all services
docker compose down              # Stop everything

# Database
# Migrations are applied automatically via docker-entrypoint-initdb.d
# For manual migration, use golang-migrate or similar tool
```

## Conventions

- **Frontend**: Functional components, hooks, no class components. `@/*` path alias maps to `src/`.
- **Go**: Standard library `net/http` patterns. chi for routing. zerolog for structured logging.
- **Naming**: PascalCase for components/types, camelCase for functions/variables, snake_case for DB columns and proto fields.
- **State**: Zustand stores (not Redux). API state via api-client package.
- **Errors**: All Go handlers return JSON `{"error": "message"}` with appropriate HTTP status.
- **Crypto**: Never store private keys on server. Never log encrypted payloads. Session keys are ephemeral.

## Environment

- Node.js >= 20
- Go >= 1.23
- PostgreSQL 16
- Redis 7
- Docker & Docker Compose for local dev
