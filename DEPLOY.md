# Deploying Haseen

This repo now supports a production-style Docker deployment for the full suite on a single VPS.

Target production host: configured via GitHub Actions secret `SSH_HOST` (Intel/AMD64)

## What this setup does

- Runs PostgreSQL, Redis, the Go services, and the gateway with Docker Compose
- Builds and publishes production images in GitHub Actions, then deploys by pulling images on the server
- Serves each SPA behind `haseen.me/<app>` path prefixes with `index.html` fallback
- Proxies `/api/*` from each frontend container to the internal gateway
- Keeps service ports bound to `127.0.0.1` so you can terminate TLS at a host-level reverse proxy
- Uses Intel-only images (`linux/amd64`)

## Recommended topology

Use one small VPS and put Caddy or Nginx on the host in front of Docker:

- `haseen.me` -> `127.0.0.1:3000`
- `haseen.me/mail` -> `127.0.0.1:3001`
- `haseen.me/accounts` -> `127.0.0.1:3003`
- `haseen.me/drive` -> `127.0.0.1:3002`
- `haseen.me/calendar` -> `127.0.0.1:3004`
- `haseen.me/contacts` -> `127.0.0.1:3005`

## 1. Prepare the server

Install:

- Docker Engine
- Docker Compose plugin
- Caddy or Nginx

Then copy the repo to the server so this layout is preserved:

- `/path/to/repo/haseen-apps`
- `/path/to/repo/ui`

The frontend build depends on the sibling `ui/` package, so both directories must be present.

Create deploy path first as `root`, then delegate runtime ownership to `nazim`:

```bash
ssh root@<SSH_HOST>
mkdir -p /opt/haseen-apps
chown -R nazim:nazim /opt/haseen-apps
chmod 750 /opt/haseen-apps
```

## 2. Create production env vars

From [`.env.production.example`](/home/nazim/Softwares/haseen-me/haseen-apps/.env.production.example), create `.env.production` in [haseen-apps](/home/nazim/Softwares/haseen-me/haseen-apps).

Minimum required values:

- `POSTGRES_PASSWORD`
- `SESSION_SECRET`
- `CORS_ALLOWED_ORIGINS`
- SMTP values if you need outbound mail

Recommended DB identifiers for production:

- `POSTGRES_DB=haseen-apps-db`
- `POSTGRES_USER=haseen-sysuser`

## 3. Start the stack

From [haseen-apps](/home/nazim/Softwares/haseen-me/haseen-apps):

```bash
cp .env.production.example .env.production
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

For GitHub Actions based deploys, the production workflow now builds Intel images in CI and the server only runs:

```bash
IMAGE_TAG=<git-sha> docker compose --env-file .env.production -f docker-compose.prod.yml pull
IMAGE_TAG=<git-sha> docker compose --env-file .env.production -f docker-compose.prod.yml up -d --remove-orphans --no-build --wait
```

Check status:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps
curl http://127.0.0.1:8080/api/health
```

## 4. Put TLS in front

Do **not** overwrite system-wide Caddy config from this repository on shared servers. If two sites are already live, merge only the required `haseen.me` routes into the existing reverse-proxy setup.

The deploy workflow intentionally does **not** replace `/etc/caddy/Caddyfile`.

Example Caddyfile:

```caddy
haseen.me {
  handle_path /mail* {
    reverse_proxy 127.0.0.1:3001
  }

  handle_path /accounts* {
    reverse_proxy 127.0.0.1:3003
  }

  handle_path /drive* {
    reverse_proxy 127.0.0.1:3002
  }

  handle_path /calendar* {
    reverse_proxy 127.0.0.1:3004
  }

  handle_path /contacts* {
    reverse_proxy 127.0.0.1:3005
  }

  reverse_proxy 127.0.0.1:3000
}
```

Because each frontend proxies `/api` internally to the Docker `gateway` service, your browser stays same-origin on `https://haseen.me` and you avoid extra frontend env configuration.

## Notes

- Deep links like `/mail`, `/accounts/sign-in`, and `/calendar` work because Caddy strips the app prefix before proxying and each SPA is built with the matching Vite `base`.
- Production deploys should avoid `docker compose ... up -d --build` on the VPS unless you intentionally want an emergency local rebuild.
- If you deploy on domains other than `haseen.me`, set `CORS_ALLOWED_ORIGINS` to those exact origins.
- The production compose file binds public ports to `127.0.0.1` on purpose. Expose them publicly only if you are not using a reverse proxy.

## GitHub Actions secrets (required)

Set these repository secrets for deployment:

- `SSH_HOST` = your production server host/IP
- `SSH_USER` = `nazim`
- `SERVER_SSH_KEY` = private key allowed for `nazim` login
- `ENV_PRODUCTION` = full `.env.production` file content
