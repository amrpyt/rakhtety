## 1. Server Readiness

- [ ] 1.1 Inspect server OS, Docker, Compose, memory, disk, firewall, ports, and existing containers.
- [x] 1.2 Record server findings without secrets in `server-readiness.md`.
- [ ] 1.3 Choose the production hostname and verify DNS points to the server IP.
- [ ] 1.4 Verify ports `80` and `443` are reachable from the public internet.

## 2. Deployment Configuration

- [x] 2.1 Create Git-tracked production compose and Traefik configuration templates.
- [x] 2.2 Create a server-only `.env` template with secret placeholders and document required values.
- [x] 2.3 Configure Traefik with Docker provider, `exposedByDefault=false`, HTTP-to-HTTPS redirect, and Let's Encrypt storage.
- [x] 2.4 Configure service labels so only the intended frontend/backend routes are public.
- [x] 2.5 Confirm no database, Redis, worker, or internal Frappe ports are exposed publicly.

## 3. Image and App Deployment

- [ ] 3.1 Build or publish a tagged production `rakhtety-frappe` image that includes `rakhtety_frappe`.
- [ ] 3.2 Start production database, Redis, Frappe backend, workers, scheduler, websocket, and Traefik.
- [ ] 3.3 Create or migrate the production Frappe site.
- [ ] 3.4 Install and migrate `rakhtety_frappe` on the production site.
- [ ] 3.5 Verify `rakhtety_frappe` appears in the bench apps list on the server.

## 4. Frontend Wiring

- [ ] 4.1 Configure production Next.js environment variables for the Frappe API URL and credentials.
- [ ] 4.2 Deploy or restart the frontend with the production Frappe environment.
- [ ] 4.3 Verify the frontend can read Frappe workflow data over HTTPS.
- [ ] 4.4 Verify workflow write actions over HTTPS using Browser Use.

## 5. Operational Proof

- [ ] 5.1 Run service health checks for Traefik, frontend, backend, workers, scheduler, websocket, MariaDB, and Redis.
- [ ] 5.2 Verify trusted SSL certificate and HTTP-to-HTTPS redirect.
- [ ] 5.3 Run Browser Use production smoke for client workflow read/write, document gate, and dependency gate.
- [ ] 5.4 Create a production backup containing database and files.
- [ ] 5.5 Restore the backup into a clean smoke target and verify the Frappe API can read restored workflow data.
- [ ] 5.6 Record health, SSL, backup, restore, and browser proof in `production-proof.md`.

## 6. Rollback and Handoff

- [ ] 6.1 Document rollback commands for previous image tag and pre-migration backup restore.
- [ ] 6.2 Test rollback logic on a non-production smoke target when possible.
- [x] 6.3 Update `learning.md` with deployment discoveries, errors, and final server facts.
- [x] 6.4 Run `openspec validate deploy-frappe-production-server --strict`.
- [ ] 6.5 Commit the completed deployment artifacts after checks pass.
