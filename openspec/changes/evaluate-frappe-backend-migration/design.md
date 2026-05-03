## Context

Rakhtety currently has a custom Next.js frontend with Supabase-backed business logic. The product scope has grown into ERP territory: client records, assigned employees, workflow dependencies, step documents, finance tracking, role gates, and reports.

The user also has a private office server. That changes the deployment assumption from serverless-first to server-hosted-first for this spike. The spike must prove whether Frappe can run as the backend engine on that server while Rakhtety keeps a simple Arabic RTL frontend.

## Goals / Non-Goals

**Goals:**
- Prove Frappe can model the core Rakhtety business slice without forcing users into Frappe Desk for daily work.
- Prove Next.js can authenticate with, read from, and write to Frappe APIs.
- Prove the server can host the proposed shape with HTTPS, file upload, backups, and basic health checks.
- Produce a go/no-go decision for a larger migration.

**Non-Goals:**
- Do not migrate current production data.
- Do not rebuild the whole app.
- Do not replace the current UI with Frappe Desk.
- Do not prove every ERPNext accounting feature.
- Do not store server credentials in repo files, specs, logs, or commits.

## Decisions

### Use Frappe as backend engine, not primary UX

Rakhtety users need a simple office workflow UI. Frappe Desk is powerful but too dense for the target UX. The spike will use Frappe for DocTypes, permissions, files, workflow state, and admin escape hatches, while Next.js remains the office-facing interface.

Alternative considered: use ERPNext/Frappe Desk directly. Rejected for the spike because it would solve backend complexity but likely hurt daily office usability.

Alternative considered: continue custom Supabase backend only. Kept as fallback, but the spike exists because backend complexity is growing faster than the current custom model.

### Keep the spike slice intentionally small

The spike will model one happy-path business slice:
- Client
- Device License workflow
- Device License workflow steps
- Step assignment to an employee
- Step document upload
- Step finance fields
- Device License completion
- Excavation Permit blocked until Device License is complete

This proves the hard parts without pretending to finish the migration.

### Treat deployment as part of the spike

The user-provided server is part of the product reality. The spike is not successful unless it proves a plausible deployment path with reverse proxy, TLS, backup, and file storage.

Preferred first deployment shape:

```text
server
├─ reverse proxy
│  ├─ app domain -> Next.js frontend
│  └─ ERP/admin domain -> Frappe backend
├─ Frappe stack
│  ├─ MariaDB
│  ├─ Redis
│  ├─ workers
│  └─ file storage
└─ backup job
```

Bench and Docker are both acceptable for investigation. The spike should choose the one that is easiest to repeat and maintain on the actual server.

## Risks / Trade-offs

- Frappe permissions do not map cleanly to assigned-work visibility -> Build the assignment rule in the spike first; fail fast if it becomes unnatural.
- Frappe workflow model is too rigid for Rakhtety's custom steps -> Model the exact Device License dependency and step completion gate, not a toy workflow.
- Frappe Desk remains necessary for too many office tasks -> Keep Next.js responsible for the daily workflow and use Desk only for admin/back-office escape hatches.
- Server setup becomes fragile -> Prefer a documented repeatable install path and include backup/restore proof.
- API auth becomes awkward between Next.js and Frappe -> Prove login/session or token flow early before modeling extra features.
- File uploads differ from current Supabase storage -> Include one required document upload and download in the spike.

## Migration Plan

1. Inspect server OS, disk, memory, package state, and open ports.
2. Choose Bench or Docker for the spike based on server constraints.
3. Install a test Frappe site with no production data.
4. Create minimal Rakhtety DocTypes and permissions.
5. Connect one small Next.js page or route to Frappe APIs.
6. Verify the happy path in Browser Use: login, client create/read, step update, file upload, dependency block.
7. Verify deployment basics: HTTPS, restart behavior, logs, backup, restore smoke test.
8. Decide go/no-go:
   - Go: Frappe handles the business slice clearly and deployment is maintainable.
   - No-go: Frappe adds more friction than the current custom backend.

Rollback for the spike is simple: stop/remove the test Frappe deployment and keep the current Supabase app untouched.

## Open Questions

- What OS and resources does the server have?
- Is there a real domain ready, or should the spike use the server IP first?
- Should the first deployment be Docker-based or Bench-based?
- Should ERPNext be installed, or should the spike use plain Frappe custom app first?
- Which workflows beyond Device License must be proven before migration is worth it?
