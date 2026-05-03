# Retrospective

## Milestone: v1.0 — MVP

**Shipped:** 2026-05-03  
**Phases:** 7  
**Plans:** 26

### What Was Built

- Arabic RTL permit-office ERP shell with auth, roles, clients, employees, and workflow UI.
- Device License and Excavation Permit workflows with dependency enforcement.
- Financial event ledger, payment recording, debt calculation, and dashboard totals.
- Document upload, metadata storage, required-document completion gate, and intake document validation.
- KPI dashboard, bottleneck detection, employee workload tracking, and in-app alerts.
- Arabic client report page with PDF/browser print support.
- Cloudflare/OpenNext build path proven under WSL/Linux.

### What Worked

- GSD phase summaries made it possible to backfill missing verification without guessing.
- Browser Use login/dashboard/client/employee smoke test gave fast live confidence.
- The audit caught real cross-phase wiring issues before milestone archive.

### What Was Inefficient

- Phase 1 and Phase 2 were missing verification files until the milestone audit.
- Some requirements were implemented but left unchecked in `REQUIREMENTS.md`.
- OpenNext on Windows created avoidable noise; WSL/Linux is the right build environment for deployment packaging.

### Patterns Established

- Permission-sensitive mutations should go through server API routes with `requirePermission`.
- Client creation with required files should be one server-owned flow with rollback.
- Dashboard server routes should use the request-bound Supabase client, not browser repositories.

### Key Lessons

- Run milestone audit before deleting future phases or archiving; it finds the real loose wires.
- Keep verification files current at each phase close.
- For this repo, Cloudflare proof should run in WSL/Linux or CI, not native Windows.

## Cross-Milestone Trends

| Theme | v1.0 Observation |
|-------|------------------|
| Verification | Needs to happen during every phase, not only at milestone close. |
| Deployment | Cloudflare/OpenNext requires Linux/WSL proof. |
| API security | Server routes are the stable pattern for admin and dashboard data. |
