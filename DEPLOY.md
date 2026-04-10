# Deploying Haseen

This repo now supports a production-style Docker deployment for the full suite on a single VPS.

## What this setup does

- Runs PostgreSQL, Redis, the Go services, and the gateway with Docker Compose
- Builds each Vite frontend into its own Nginx container
- Serves each SPA with `index.html` fallback so deep links work
- Proxies `/api/*` from each frontend container to the internal gateway
- Keeps service ports bound to `127.0.0.1` so you can terminate TLS at a host-level reverse proxy

## Recommended topology

Use one small VPS and put Caddy or Nginx on the host in front of Docker:

- `haseen.me` -> `127.0.0.1:3000`
- `mail.haseen.me` -> `127.0.0.1:3001`
- `accounts.haseen.me` -> `127.0.0.1:3003`
- `drive.haseen.me` -> `127.0.0.1:3002`
- `calendar.haseen.me` -> `127.0.0.1:3004`
- `contacts.haseen.me` -> `127.0.0.1:3005`

## 1. Prepare the server

Install:

- Docker Engine
- Docker Compose plugin
- Caddy or Nginx

Then copy the repo to the server so this layout is preserved:

- `/path/to/repo/haseen-apps`
- `/path/to/repo/ui`

The frontend build depends on the sibling `ui/` package, so both directories must be present.

## 2. Create production env vars

From [`.env.production.example`](/home/nazim/Softwares/haseen-me/haseen-apps/.env.production.example), create `.env.production` in [haseen-apps](/home/nazim/Softwares/haseen-me/haseen-apps).

Minimum required values:

- `POSTGRES_PASSWORD`
- `SESSION_SECRET`
- `CORS_ALLOWED_ORIGINS`
- SMTP values if you need outbound mail

## 3. Start the stack

From [haseen-apps](/home/nazim/Softwares/haseen-me/haseen-apps):

```bash
cp .env.production.example .env.production
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

Check status:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps
curl http://127.0.0.1:8080/api/health
```

## 4. Put TLS in front

Example Caddyfile:

```caddy
haseen.me {
  reverse_proxy 127.0.0.1:3000
}

mail.haseen.me {
  reverse_proxy 127.0.0.1:3001
}

accounts.haseen.me {
  reverse_proxy 127.0.0.1:3003
}

drive.haseen.me {
  reverse_proxy 127.0.0.1:3002
}

calendar.haseen.me {
  reverse_proxy 127.0.0.1:3004
}

contacts.haseen.me {
  reverse_proxy 127.0.0.1:3005
}
```

Because each frontend proxies `/api` internally to the Docker `gateway` service, your browser stays same-origin and you avoid extra frontend env configuration.

## Notes

- Deep links like `/sign-in` and `/settings/security` work because the Nginx frontend config uses SPA rewrites.
- If you deploy on domains other than `*.haseen.me`, set `CORS_ALLOWED_ORIGINS` to those exact origins.
- The production compose file binds public ports to `127.0.0.1` on purpose. Expose them publicly only if you are not using a reverse proxy.
