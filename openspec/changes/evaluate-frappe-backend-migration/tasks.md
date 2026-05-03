## 1. Server Discovery

- [x] 1.1 Confirm the server login method without committing or printing secrets.
- [x] 1.2 Inspect OS, CPU, memory, disk, package manager, and open ports.
- [x] 1.3 Check whether Docker, Python, Node.js, Nginx/Caddy, MariaDB, Redis, or existing web services are installed.
- [x] 1.4 Decide whether the spike should use Frappe Bench or Docker on this server.

## 2. Frappe Test Backend

- [x] 2.1 Create a test Frappe site with no production Rakhtety data.
- [x] 2.2 Create minimal Rakhtety backend records for client, workflow, workflow step, employee assignment, document, and finance fields.
- [x] 2.3 Add the Device License workflow path with five steps.
- [x] 2.4 Add the Excavation Permit dependency rule that blocks start until Device License is complete.
- [x] 2.5 Add one required document gate before step completion.
- [x] 2.6 Add employee assignment visibility for assigned work only.

## 3. Next.js Integration Proof

- [x] 3.1 Create a small isolated integration path from the current Next.js app to the Frappe test site.
- [x] 3.2 Read one client workflow from Frappe and render it in the Rakhtety UI shape.
- [x] 3.3 Update one workflow step from Next.js and verify Frappe persists it.
- [x] 3.4 Upload one required document from Next.js and verify Frappe stores it.
- [x] 3.5 Verify the frontend shows the dependency block before Device License completion.

## 4. Deployment Proof

- [x] 4.1 Define frontend and backend URLs for the server deployment.
- [x] 4.2 Configure reverse proxy routing for frontend and Frappe backend/admin.
- [x] 4.3 Configure HTTPS or document the exact blocker if no domain is available.
- [x] 4.4 Verify the Frappe test site restarts cleanly after service restart or server reboot.
- [x] 4.5 Verify logs are accessible for frontend, backend, workers, database, and proxy.

## 5. Backup Proof

- [x] 5.1 Create a database backup for the Frappe test site.
- [x] 5.2 Create a file backup for uploaded test documents.
- [x] 5.3 Run a restore smoke test using test data.
- [x] 5.4 Document backup location, command, retention assumption, and restore command.

## 6. Browser Verification

- [x] 6.1 Use Browser Use to verify login or authenticated access against the test deployment.
- [x] 6.2 Use Browser Use to verify client workflow read.
- [x] 6.3 Use Browser Use to verify step update.
- [x] 6.4 Use Browser Use to verify required document upload.
- [x] 6.5 Use Browser Use to verify employee access does not show unrelated work.

## 7. Decision

- [x] 7.1 Write the final spike result: migrate, do not migrate, or run a second spike.
- [x] 7.2 List evidence for the decision, including API fit, workflow fit, permission fit, file fit, and deployment fit.
- [x] 7.3 List blockers and estimated next work if migration is approved.
