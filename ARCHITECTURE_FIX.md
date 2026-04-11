# Quick Fix: Multi-Platform Deployment

## Problem
Docker images are AMD64 only, but production server is ARM64. Backend Go services crash on startup.

## Solution (5 minutes)

### Step 1: Update GitHub Repository Variables
- Go to: https://github.com/haseen-me/haseen-apps/settings/variables/actions
- Find or create: `DEPLOY_PLATFORMS`
- Change value to: `linux/amd64,linux/arm64`
- Save

### Step 2: Trigger Build
Push any commit to main branch (or use workflow_dispatch):
```bash
git push origin main
```

### Step 3: Wait for Workflow
- Build time: ~90 minutes
- Check progress: https://github.com/haseen-me/haseen-apps/actions

### Step 4: Verify Images
Once workflow completes, images will be in GHCR with both platforms:
- ghcr.io/haseen-me/auth:COMMIT_SHA (amd64 + arm64)
- ghcr.io/haseen-me/mail:COMMIT_SHA (amd64 + arm64)
- etc.

### Step 5: Deploy to Server
```bash
ssh root@204.168.246.210

cd /opt/haseen-apps

# Set the image tag to the new commit SHA
export IMAGE_TAG="COMMIT_SHA_FROM_GITHUB"

# Restart all services with new images
docker compose --env-file .env.production -f docker-compose.prod.yml down
docker compose --env-file .env.production -f docker-compose.prod.yml up -d
```

## What's Already Done
✅ `.env.production` created with all required secrets
✅ Database and Redis running
✅ Frontend services healthy
✅ Workflow supports multi-platform builds
✅ Just needs GitHub var update and rebuild

## Verification
After deployment, check all services:
```bash
ssh root@204.168.246.210 "docker ps --format 'table {{.Names}}\t{{.Status}}' | grep -E '(auth|mail|drive|gateway|keyserver)'"
```

All should show: `Up X seconds (healthy)` or `Up X minutes (starting)`

---
**Estimated Total Time:** ~90 minutes (mostly build time)  
**Downtime:** ~30 seconds during service restart
