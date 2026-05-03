# Rakhtety Learning Log

This file records useful facts learned during implementation sessions so the next agent can continue without rediscovering the same things.

## 2026-05-03 16:37 +03:00 - Frappe backend spike and server deployment

### Server access

- Target server IP is `57.131.19.110`.
- SSH password login is disabled; the server only accepts public-key login.
- The provided `amr` SSH username did not accept the provided key.
- The same key worked with SSH user `ubuntu`.
- The key file initially had loose Windows permissions, so OpenSSH ignored it until permissions were tightened.
- Do not commit keys, passwords, or server secrets.

### Server facts

- Server OS: Ubuntu 25.04.
- Server resources: 4 vCPU, about 15 GiB RAM, about 87 GiB free disk.
- `sudo` works for the `ubuntu` user without a password.
- Existing Node services were already listening on ports `5173` and `3001`.
- Docker was not installed at first; Docker and Docker Compose v2 were installed during the spike.
- Server had a pending kernel upgrade, but it was not rebooted to avoid disrupting existing apps.

### Frappe/ERPNext spike

- Frappe/ERPNext was started with Docker Compose from `frappe_docker/pwd.yml`.
- Frappe is running on the server internally at `http://127.0.0.1:8080`.
- Public port `8080` was not reachable from the local machine, so local access used an SSH tunnel:
  `localhost:8081 -> server 127.0.0.1:8080`.
- Frappe login worked with the test `Administrator` account.
- Frappe Desk reached `/desk/setup-wizard`, but the page looked blank through the tunnel because socket.io rejected the tunnel origin as `Invalid origin`.
- The custom Rakhtety user UX should stay in Next.js; Frappe should be treated as the backend engine.

### Frappe data model proof

- Created a quick spike module inside the running Frappe container only for proof.
- This is not production-ready; real implementation should use a proper Frappe custom app.
- Created test DocTypes:
  - `Rakhtety Client`
  - `Rakhtety Employee`
  - `Rakhtety Workflow`
  - `Rakhtety Workflow Step`
  - `Rakhtety Document`
- Seeded test data:
  - Client: `Test Client One`
  - Employee: `Ahmed Employee`
  - Device License workflow with 5 steps
- Proven backend rules:
  - Device License stores Arabic step names.
  - Steps store assigned employee, government fees, office profit, and document flags.
  - Required document gate blocks completion until document marker exists.
  - Excavation Permit is blocked until Device License is completed.
  - After all Device License steps complete, Excavation Permit can start.

### Next.js integration proof

- Added isolated spike API route:
  `src/app/api/spikes/frappe/client-workflow/route.ts`
- Added isolated spike UI page:
  `src/app/spikes/frappe/page.tsx`
- Required env vars:
  - `FRAPPE_BASE_URL`
  - `FRAPPE_USERNAME`
  - `FRAPPE_PASSWORD`
  - optional `FRAPPE_SPIKE_LOCAL_URL`
- Local test route worked when `FRAPPE_BASE_URL=http://localhost:8081`.
- Browser Use headed mode verified the Rakhtety spike page at:
  `http://localhost:3010/spikes/frappe`
- The page showed real Frappe data: `Test Client One`, completed Device License, Arabic steps, fees, profit, assignment, and document status.

### Traefik and SSL

- Traefik was installed with Docker on the server.
- Traefik container name: `rakhtety-traefik`.
- Traefik config paths on server:
  - `~/rakhtety-spike/traefik/docker-compose.yml`
  - `~/rakhtety-spike/traefik/traefik.yml`
  - `~/rakhtety-spike/frappe_docker/traefik-frappe.override.yml`
  - `~/rakhtety-spike/letsencrypt/acme.json`
- Configured intended route:
  `frappe-spike.coderaai.com -> Frappe frontend container`.
- Local Traefik routing worked on the server when forcing host resolution to `127.0.0.1`.
- Trusted SSL is not complete yet.

### Domain and networking blockers

- `frappe-spike.coderaai.com` currently resolves to `156.67.25.212`.
- The Rakhtety spike server is `57.131.19.110`.
- Therefore the wildcard DNS for `coderaai.com` is not pointing at the spike server.
- External connection tests to `57.131.19.110:80` and `57.131.19.110:443` timed out.
- Server `ufw` is inactive, and Docker is listening on ports `80` and `443`, so the public block is likely at the hosting provider firewall/security group level.

### Domain workarounds

- Best clean fix: create/update DNS record `frappe-spike.coderaai.com -> 57.131.19.110`, then open inbound `80/tcp` and `443/tcp` at the hosting provider.
- If changing DNS is hard: use Cloudflare Tunnel. This avoids opening inbound ports and gives HTTPS through Cloudflare, but it adds a dependency on Cloudflare.
- If wildcard DNS must stay pointed elsewhere: create a specific A record for `frappe-spike.coderaai.com` that overrides the wildcard.
- If the old server at `156.67.25.212` must stay in front: configure that server as a reverse proxy to `57.131.19.110`, but this is more moving parts.
- For private office-only access: Tailscale can expose the app privately without public DNS, but this is not ideal for normal customer access.

### 2026-05-03 16:44 +03:00 - Cloudflare Quick Tunnel proof

- User approved using free domains after asking about Dokploy-style generated domains.
- Dokploy uses `traefik.me` generated domains, but those still require public traffic to reach server ports `80/443`.
- Cloudflare Quick Tunnel was tested because it does not require inbound ports.
- Started Docker container `rakhtety-cloudflared` on the server.
- Tunnel target: `http://127.0.0.1:8080` on the server, which is the Frappe frontend.
- Temporary HTTPS URL generated:
  `https://era-earrings-finest-casio.trycloudflare.com`
- External check returned HTTP 200 and found the Frappe login page.
- External Frappe login API worked and returned:
  `{"message":"Logged In","home_page":"desk","full_name":"Administrator"}`
- Browser Use headed verification could not be completed in this step because the Browser Use runtime failed to start its local app-server with a missing-path error.
- For production, use a named Cloudflare Tunnel connected to the user's Cloudflare account instead of temporary `trycloudflare.com`.

### 2026-05-03 - Next.js write path proof

- Added isolated Next.js spike APIs for Frappe writes:
  - `/api/spikes/frappe/upload-document`
  - `/api/spikes/frappe/update-step`
  - `/api/spikes/frappe/start-excavation`
- Added buttons to `/spikes/frappe` for upload, complete step, and start excavation.
- Created Frappe test client `Blocked Client` to prove dependency blocking before Device License completion.
- Starting Excavation for `Blocked Client` before completion returned the expected Frappe validation error.
- Uploading required document marker through Next.js worked.
- Completing `Blocked Client - Eligibility Statement` through Next.js worked and changed the Frappe workflow status to `Completed`.
- Starting Excavation after completion worked and created `Blocked Client - Excavation Permit`.
- Browser Use headed runtime loaded the spike page and DOM showed `Blocked Client`, `Device License Completed`, `المستند: مرفوع`, and `Excavation Permit In Progress`.
- Browser Use screenshot capture timed out once, but DOM verification succeeded.

### Best-practice notes

- Keep Traefik as the edge router and put Frappe/Next.js behind it.
- Use real subdomains, for example:
  - `app.coderaai.com` for Rakhtety custom frontend
  - `frappe.coderaai.com` or `erp.coderaai.com` for Frappe admin
- Do not rely on patched files inside a running Frappe container for production.
- Move Rakhtety Frappe code into a real Frappe custom app before migration.
- Backups must cover both MariaDB and uploaded files.
- Do not claim production readiness until backup and restore are proven.

### Current OpenSpec change

- Active change: `evaluate-frappe-backend-migration`.
- Last known progress after Traefik/browser proof: 18 of 32 tasks complete.
- Remaining major areas:
  - Next.js write/update proof
  - Next.js file upload proof
  - service restart proof
  - backup and restore proof
  - final go/no-go decision

### 2026-05-03 17:52 +03:00 - Restart and backup proof

- Restarted Frappe services on the server with Docker Compose:
  `backend`, `frontend`, `queue-short`, `queue-long`, `scheduler`, and `websocket`.
- After restart, local Frappe HTTP check returned `200`.
- Cloudflare tunnel container stayed running during Frappe service restart.
- Created Frappe backup with:
  `bench --site frontend backup --with-files`.
- Backup files were created under:
  `/home/frappe/frappe-bench/sites/frontend/private/backups/`.
- Latest backup files:
  - `20260503_202146-frontend-database.sql.gz`
  - `20260503_202146-frontend-site_config_backup.json`
  - `20260503_202146-frontend-files.tar`
  - `20260503_202146-frontend-private-files.tar`
- Restore smoke test checked archive integrity:
  - `gzip -t` passed for database backup.
  - `tar -tf` passed for public file backup.
  - `tar -tf` passed for private file backup.
- Full restore drill was not done yet because the spike code is patched inside the running Frappe container. Production restore proof should wait until Rakhtety code is moved into a real Frappe custom app.
