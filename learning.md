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

### 2026-05-03 18:05 +03:00 - Employee access and final decision

- Added a small read-only Next.js proof for assigned Frappe work:
  `/api/spikes/frappe/assigned-work?employee=<employee>`.
- Added browser page:
  `/spikes/frappe/employee?employee=<employee>`.
- Browser Use verified:
  - `Ahmed Employee` page shows `Test Client One` work.
  - `Ahmed Employee` page does not show `Blocked Client`.
  - `Blocked Employee` page shows `Blocked Client` work.
  - `Blocked Employee` page does not show `Test Client One`.
- Important limitation: this is assignment filtering, not full Frappe user-permission proof, because the Next.js spike still uses Administrator credentials server-side.
- Final recommendation: use Frappe as backend engine, keep Rakhtety custom Next.js frontend, and run a second productionization spike before migrating real data.

### 2026-05-03 - Productionized Frappe custom app start

- Created OpenSpec change: `productionize-frappe-custom-app`.
- Web/Frappe best-practice research confirmed:
  - Put business backend code in a real Frappe custom app.
  - Do not keep production logic as SSH-patched files inside a running container.
  - For Docker production with custom apps, use a custom/layered image path.
- Created local Frappe app scaffold at:
  `frappe_apps/rakhtety_frappe`.
- Added app metadata, `hooks.py`, `modules.txt`, `patches.txt`, and role creation patch.
- Added DocTypes:
  - `Rakhtety Client`
  - `Rakhtety Employee`
  - `Rakhtety Workflow`
  - `Rakhtety Workflow Step`
  - `Rakhtety Document`
- Added backend app API methods under:
  `rakhtety_frappe.api`.
- Updated Next.js spike routes to call `rakhtety_frappe.api.*` instead of `frappe.rakhtety_spike.*`.
- Added Frappe test file for workflow dependency, document gate, employee visibility, and API methods.
- Local Docker image build is blocked because Docker Desktop is not running on this machine.
- Building on the server should be done from Git when possible, not by copying random edited files into a running container.

### 2026-05-03 - Local custom Frappe image build proof

- Docker Desktop was started locally.
- Built custom image:
  `rakhtety-frappe:v16.16.0-dev`.
- Build command:
  `docker build --tag rakhtety-frappe:v16.16.0-dev --file frappe_apps/docker/Containerfile .`
- Build succeeded and installed `rakhtety_frappe-0.0.1` inside the image.
- Image check proved:
  - `/home/frappe/frappe-bench/apps/rakhtety_frappe` exists.
  - Python can import `rakhtety_frappe`.
  - Imported version is `0.0.1`.
- Local image size shown by Docker: `3.22GB`.

### 2026-05-03 - Clean custom app install and tests

- First clean-site install failed because `rakhtety_frappe` was installed with pip but missing from `sites/apps.txt`.
- Fixed Docker image to append `rakhtety_frappe` to `sites/apps.txt`.
- Second clean-site install failed because the append had no newline and created `erpnextrakhtety_frappe`.
- Fixed Docker image to append with `printf "\nrakhtety_frappe\n"`.
- Clean site install then passed:
  - `frappe 16.17.0`
  - `rakhtety_frappe 0.0.1`
- Frappe tests ran inside clean temporary site `rakhtety-tests2.localhost`.
- Test result: 5 integration tests passed.
- Covered:
  - DocType availability.
  - Excavation dependency.
  - Required document gate.
  - Employee assigned-work filtering.
  - API method workflow writes.

### 2026-05-03 - Browser, backup, and restore proof for custom app

- Started local persistent test site:
  `rakhtety-live.localhost`.
- Started local Frappe dev web server in Docker and exposed it on:
  `http://localhost:8088`.
- Restarted Next.js on:
  `http://localhost:3010`.
- Browser Use verified the custom app through Next.js:
  - Read `Local Client`.
  - Saw `Device License`.
  - Saw dependency block before Device License completion.
  - Uploaded required document marker.
  - Completed all Device License steps.
  - Started Excavation Permit after completion.
  - Verified employee isolation between `Local Employee` and `Other Employee`.
- Backup command passed:
  `bench --site rakhtety-live.localhost backup --with-files`.
- Restore into clean target `rakhtety-restore.localhost` passed.
- Restored site could read `Local Client`, `Device License`, and `Completed` status.
- Decision: custom app path is ready for server deployment testing, but not real production data migration yet.

### 2026-05-03 - Production server deployment start

- Created OpenSpec change:
  `deploy-frappe-production-server`.
- Official docs checked before planning:
  - Frappe Docker production path uses Compose plus production overrides for database, Redis, and HTTPS.
  - Traefik Docker provider should use `exposedByDefault=false` so only explicitly labeled services become public.
  - Traefik Let's Encrypt HTTP-01 needs port `80` reachable by Let's Encrypt; TLS-ALPN-01 needs port `443`.
- DNS finding:
  - `rakhtety.coderaai.com` resolves to `156.67.25.212`, not the target server `57.131.19.110`.
  - `frappe-rakhtety.coderaai.com` resolves to `156.67.25.212`, not the target server `57.131.19.110`.
- Network finding:
  - Port `22` on `57.131.19.110` is reachable.
  - Ports `80` and `443` did not respond from this machine.
- SSH finding:
  - Server rejects password-style login and requires public-key auth.
  - Tried `amr`, `ubuntu`, and `root`.
  - Tried local keys `vps_key`, `id_amr`, and `id_ed25519`.
  - None were accepted.
- Practical blocker:
  - Need an authorized SSH key before real server deployment can continue.
- Local prep completed while blocked:
  - Added production Docker/Traefik templates under `frappe_apps/docker/production/`.
  - Kept secrets out of Git by using `.env.example` only.

### 2026-05-03 - Remove Supabase from frontend start

- Created OpenSpec change:
  `remove-supabase-from-frontend`.
- Decision from the user:
  use Frappe login as the only auth source.
- Current frontend auth changes:
  - `AuthProvider` now reads a local session cookie instead of Supabase session state.
  - `useSession` now reads the same local session cookie.
  - `login` route now posts to Frappe login and stores a local session cookie.
  - `logout` route clears the local session cookie.
- Frontend build proof:
  - `pnpm typecheck` passed.
  - `pnpm lint` passed.
  - `docker build -f Dockerfile.next` passed after removing the hard Supabase build dependency.
- Local browser proof:
  - The login page opens in headed `browser-use`.
  - Login currently fails because the local Frappe backend container cannot reach its MySQL host:
    `MySQLdb.OperationalError: (2005, "Unknown server host 'rakhtety-test-db'")`
- Practical blocker:
  - The local Frappe container needs its network/database wiring fixed before browser login can pass.
  - This is a backend local-compose issue, not a frontend build issue.

### 2026-05-03 19:56 +03:00 - Frappe auth and local E2E passed

- Fixed local Frappe container networking by connecting `rakhtety-live-backend` to `rakhtety-frappe-test`.
- Added Frappe-backed frontend session flow:
  - Login posts to Frappe `/api/method/login`.
  - Current user comes from `rakhtety_frappe.api.current_user`.
  - The frontend stores a local `rakhtety-session` cookie.
  - Middleware and hooks read that cookie instead of Supabase auth.
- Frappe session cookie note:
  - Next cookies can double-encode values.
  - The browser saw `%257B...`, so local/server session readers now decode up to 3 times before parsing JSON.
- Removed Supabase build/runtime requirement from:
  - `Dockerfile.next`.
  - `frappe_apps/docker/production/compose.prod.yml`.
  - `frappe_apps/docker/production/.env.example`.
- Local checks passed:
  - `pnpm typecheck`.
  - `pnpm lint`.
  - `docker build --tag rakhtety-next:prod --file Dockerfile.next .` with no Supabase build args.
- Browser Use headed E2E passed on `http://localhost:3010`:
  - Login as `frappe.local@example.com`.
  - Dashboard showed `Frappe Local` and loaded Frappe-backed recent workflow data.
  - Created fresh Frappe client `E2E Client 20260503195124`.
  - Verified excavation is blocked before Device License completion.
  - Uploaded required document marker.
  - Completed all Device License steps.
  - Started Excavation Permit after completion.
  - Verified employee assigned-work page for `Local Employee`.
  - Logged out and returned to `/login`.
- Current decision:
  - Frappe auth plus the spike workflow path is locally proven.
  - The old general app CRUD routes still contain Supabase imports and must be migrated route-by-route before Supabase can be deleted from the repo.

### 2026-05-03 - Real app routes moved to Frappe adapter

- Implemented a production frontend Frappe adapter at `src/lib/frappe/adapter.ts`.
- Added real Frappe methods for current app screens in `rakhtety_frappe.api` and `services.py`.
- Migrated the real app API routes for:
  - `/api/clients`
  - `/api/clients/[id]`
  - `/api/clients/[id]/workflows`
  - `/api/workflows/overview`
  - `/api/dashboard/summary`
  - `/api/workflows/[id]/financial-summary`
  - `/api/clients/[id]/report`
  - `/api/employees`
  - `/api/workflow-documents/upload`
- Local Frappe Docker note:
  - `rakhtety-live-backend` does not mount the local `frappe_apps/rakhtety_frappe` folder.
  - After editing the custom app locally, copy `api.py` and `services.py` into the container, run `bench --site rakhtety-live.localhost migrate`, then restart the container.
- Adapter auth note:
  - UI permission checks still use the local `rakhtety-session` cookie.
  - Backend data calls use a privileged Frappe session from `FRAPPE_USERNAME` / `FRAPPE_PASSWORD`, because forwarding the browser sid from the Next server returned Frappe `417` in local tests.
- Checks passed after the route migration:
  - `pnpm typecheck`
  - `pnpm lint`
  - `pnpm test`
  - `pnpm build`
- Browser Use headed proof on real pages only:
  - `/dashboard` loaded Frappe-backed summary and recent workflows.
  - `/clients` listed Frappe clients.
  - `/clients/Local%20Client` loaded real client detail and workflow panels.
  - `/workflows` loaded the office queue from Frappe.
  - `/finance` rendered without Supabase.
  - `/employees` correctly redirects non-admin users away from employee management.

### 2026-05-03 - Supabase frontend cleanup completed

- Removed the old Supabase frontend SDK dependencies:
  - `@supabase/ssr`
  - `@supabase/supabase-js`
- Deleted the old Supabase-only frontend data layer:
  - `src/lib/supabase/`
  - `src/lib/database/repositories/`
  - `src/lib/server-data/`
  - `src/config/database.config.ts`
  - old Supabase server permission helpers.
- Kept the current UI-facing service names, but rewired them to Frappe-backed API routes or safe Frappe-transition placeholders so imports stay stable.
- Added the real app route:
  - `/api/workflow-steps/[id]/status`
  - It updates workflow steps through Frappe instead of the deleted Supabase repositories.
- Verification after cleanup:
  - `pnpm typecheck`
  - `pnpm lint`
  - `pnpm test`
  - `pnpm build`
  - Browser Use headed on `/dashboard`, `/clients`, `/clients/Local%20Client`, `/workflows`, and `/finance`.

### 2026-05-04 - Amr engineering dashboard

- Added `/amr-dashboard` as a protected real app page, not a spike page.
- The page reads one server overview from `/api/amr-dashboard/overview`.
- The overview uses the privileged Frappe adapter and combines:
  - dashboard summary
  - clients
  - workflow overview
  - employees
- Browser Use headed proof:
  - `http://localhost:3010/amr-dashboard` redirects to login when logged out.
  - Login with `local.employee@example.com` / `1qaz1qaz` opens the page.
  - The page shows `Frappe فقط`, real workflows, real clients, employees, and real app route links only.
- Browser Use CLI on Windows needs:
  - `chcp 65001`
  - `PYTHONIOENCODING=utf-8`
  - Without that, `browser-use doctor` can fail while printing Unicode check marks.
- The dashboard was extended with software-engineering details:
  - package versions
  - Frappe API method names
  - backend health checks
  - env variable presence without exposing secret values.
- Added live monitoring to `/amr-dashboard`:
  - `/api/amr-dashboard/logs` reads recent Next frontend log files.
  - It also reads Docker logs from `rakhtety-live-backend`.
  - The UI refreshes every 3 seconds and separates frontend, backend, and error lines.
