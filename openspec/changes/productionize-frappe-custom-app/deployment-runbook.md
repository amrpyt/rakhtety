# Deployment Runbook

Timestamp: 2026-05-03

## Current build blocker

Local Docker is not running:

```text
failed to connect to the docker API at npipe:////./pipe/dockerDesktopLinuxEngine
```

So the custom image has not been built yet.

Next safe choices:

1. Start Docker Desktop locally, then build from repo root.
2. Push committed code to GitHub and build on the server from Git.
3. Copy the app folder to the server for a one-time test build.

Choice 2 is the best production direction. Choice 3 is only okay as a temporary test.

## Build command

Run from repo root:

```bash
docker build \
  --tag rakhtety-frappe:v16.16.0-dev \
  --file frappe_apps/docker/Containerfile .
```

## Install command

After the backend container uses the custom image:

```bash
bench --site <site> install-app rakhtety_frappe
bench --site <site> migrate
```

## Backup before migration

```bash
bench --site <site> backup --with-files
```

Save:

- Database backup.
- Site config backup.
- Public files backup.
- Private files backup.

## Rollback

If install or migration fails:

1. Stop the new containers.
2. Switch Compose back to the previous working image tag.
3. Start the previous containers.
4. Restore the pre-migration backup if data changed.
5. Keep the failed image tag and logs for debugging.

## Log commands

For Docker Compose stack:

```bash
docker compose logs --tail=200 backend
docker compose logs --tail=200 frontend
docker compose logs --tail=200 queue-short
docker compose logs --tail=200 queue-long
docker compose logs --tail=200 scheduler
docker compose logs --tail=200 websocket
docker compose logs --tail=200 db
docker compose logs --tail=200 redis-cache
docker compose logs --tail=200 redis-queue
docker logs --tail=200 rakhtety-traefik
docker logs --tail=200 rakhtety-cloudflared
```

For live logs:

```bash
docker compose logs -f backend
docker compose logs -f queue-short
docker logs -f rakhtety-cloudflared
```

## Do not do

- Do not edit Python files inside the running container as the production source of truth.
- Do not run random bench setup commands on production just because SSH is available.
- Do not migrate before backup.
- Do not call the system production-ready until a clean restore target proves the app works after restore.
