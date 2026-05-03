## Why

The Frappe backend spike is proven locally and the OpenSpec changes are archived, so the next risk is moving from proof to a repeatable production deployment on the office server. This change turns the current Docker proof into a server-ready deployment path with Traefik, HTTPS, backups, and rollback.

## What Changes

- Add a production deployment target for the user's server using Docker Compose and the custom `rakhtety_frappe` image.
- Configure Traefik as the public reverse proxy with automatic HTTPS certificates for a real hostname.
- Add deployment scripts/runbook steps for install, migration, health checks, backup, restore, and rollback.
- Add frontend environment wiring so the Next.js app can talk to the production Frappe API.
- Add verification tasks for domain, SSL, Frappe health, Next.js integration, backup freshness, and restore smoke testing.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `frappe-production-deployment`: make the deployment contract concrete for the production server, Traefik HTTPS, operational checks, and rollback.

## Impact

- Affected systems: target Linux server, Docker Engine, Docker Compose, Traefik, Let's Encrypt, Frappe site, MariaDB, Redis, Next.js frontend, DNS records.
- Affected repo areas: `frappe_apps/docker/`, deployment documentation, OpenSpec specs, and frontend environment configuration.
- External dependencies: public DNS for the selected hostname, inbound ports `80` and `443`, and a valid email for Let's Encrypt notifications.
