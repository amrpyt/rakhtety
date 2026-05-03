## Context

The project now has a tested `rakhtety_frappe` custom app, a custom Docker image path, local Frappe integration proof, and archived production deployment requirements. The remaining work is to make the office server run the same shape repeatably.

Best-practice references checked on 2026-05-03:

- Frappe Docker documents production as `compose.yaml` plus production overrides for MariaDB, Redis, and HTTPS.
- Frappe Docker documents custom production images through `apps.json` and the customizable image flow.
- Traefik's Docker provider best practice is `exposedByDefault=false`, explicit service labels, and a shared proxy network.
- Traefik/Let's Encrypt requires public DNS pointing at the server and public inbound `80/443` for HTTP challenge, or `443` for TLS challenge.

The deployment should avoid manual edits inside running containers. Git-tracked files and tagged images are the source of truth.

## Goals / Non-Goals

**Goals:**

- Deploy the custom Frappe backend on the target server using Docker Compose.
- Put Traefik in front of Frappe with automatic HTTPS.
- Use a real hostname under the user's available domain or a temporary free hostname if DNS is not ready.
- Wire the Next.js frontend to the production Frappe API.
- Prove health, API integration, backup creation, and restore smoke test.
- Document rollback so a failed migration can be undone.

**Non-Goals:**

- Rebuild the entire frontend in this change.
- Move existing Supabase production data into Frappe unless a separate migration spec is opened.
- Replace Frappe Desk UX for office users; the main UX remains the Next.js app.
- Add multi-server orchestration, Kubernetes, or Docker Swarm.

## Decisions

### Decision: Use Docker Compose on one server

Use Docker Compose because the current proof, Frappe Docker docs, and the user's server shape are single-server. This is simpler than Kubernetes and easier to debug over SSH.

Alternative considered: Dokploy-managed deployment. It can work, but it adds another control layer while we are still proving the app/backend contract. We can add it later if the Docker Compose deployment is stable.

### Decision: Use Traefik as the only public reverse proxy

Traefik will own ports `80` and `443`, terminate TLS, redirect HTTP to HTTPS, and route to Frappe/Next services by hostname. This matches Traefik's Docker-provider model and avoids exposing backend container ports directly.

Alternative considered: Frappe's internal Nginx only. That works for one app, but Traefik is better for adding frontend, backend, admin, and future tools under separate hostnames.

### Decision: Prefer a real subdomain under `coderaai.com`

Use a hostname such as `rakhtety.coderaai.com` or `frappe-rakhtety.coderaai.com` when DNS can point to `57.131.19.110`. If DNS remains blocked, use a temporary HTTPS tunnel only as a test path, not as the final production contract.

Alternative considered: free random domains. They help demos, but production needs a stable hostname for cookies, redirects, SSL renewal, and office bookmarks.

### Decision: Deploy from Git-tracked scripts and tagged images

The server should pull repo changes, build or pull the custom image, run migrations, and restart services using documented commands. No production code should be changed with `docker exec` edits.

Alternative considered: copying edited files through SSH. That was acceptable for the spike but is not acceptable for repeatable production.

### Decision: Backup before every migration

Before installing or migrating `rakhtety_frappe`, run a Frappe backup that includes database and files. Rollback means returning to the previous image tag and restoring that backup.

Alternative considered: relying on Docker volumes only. Volumes help persistence, but they are not a rollback plan.

## Risks / Trade-offs

- DNS does not point to the server -> use a temporary tunnel for testing, then block production sign-off until DNS is corrected.
- Ports `80/443` are closed or used by another service -> inspect listeners first, stop conflicting proxy only after documenting it, then let Traefik own the ports.
- Let's Encrypt rate limits during repeated tests -> use staging ACME for debugging, then switch to production ACME once routing works.
- Migration fails after partial app install -> restore the pre-migration backup and return to the previous image tag.
- Server is small for Frappe -> monitor memory, disk, workers, queue, and MariaDB; reduce worker count only if needed.
- Secrets leak into Git -> use `.env` on server and example env files in Git, never commit passwords or API keys.

## Migration Plan

1. Inspect the server: OS, Docker version, Compose version, disk, memory, ports, existing containers, and firewall.
2. Choose hostname and confirm DNS points to `57.131.19.110`.
3. Create server deployment directory, `.env`, Traefik storage, Docker networks, and volumes.
4. Build or pull the tagged `rakhtety-frappe` image.
5. Start MariaDB, Redis, Frappe backend, workers, websocket, scheduler, frontend, and Traefik.
6. Create or migrate the Frappe site and install `rakhtety_frappe`.
7. Run health checks and Browser Use checks against the HTTPS hostname.
8. Create a backup and restore it into a clean smoke target.
9. Record commands, proof, URLs, and rollback notes in the change artifacts and `learning.md`.

Rollback:

1. Stop write traffic if possible.
2. Switch services back to the previous image tag.
3. Restore the latest known-good Frappe backup.
4. Re-run health checks.

## Open Questions

- Which hostname should be final: `rakhtety.coderaai.com`, `frappe-rakhtety.coderaai.com`, or another subdomain?
- Should Next.js run on the same server now, or should the first deployment expose only Frappe backend while local Next.js continues testing?
- Which email should be used for Let's Encrypt notifications?
