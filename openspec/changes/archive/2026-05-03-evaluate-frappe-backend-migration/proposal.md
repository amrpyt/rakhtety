## Why

Rakhtety now has real ERP weight: clients, employees, workflow rules, files, finance, reports, and permissions. Building every backend rule from scratch is becoming risky, so we need to prove whether Frappe/ERPNext can carry the backend while Rakhtety keeps its custom Arabic UX.

The user also has a private server for office deployment, so this change must evaluate both backend fit and deployment fit before any rewrite starts.

## What Changes

- Run a small proof-of-concept for Frappe as the backend engine for Rakhtety.
- Keep the current Next.js frontend idea as the main office UX.
- Model only the minimum business slice in Frappe: clients, device-license workflow, workflow steps, assignment, documents, and finance fields.
- Prove Next.js can read and write that slice through Frappe APIs.
- Prove the target server can host the backend/frontend shape, including HTTPS, backups, and file storage.
- Define clear go/no-go criteria before deciding on a larger migration.
- **BREAKING**: No production data or current Supabase implementation is migrated during the spike.

## Capabilities

### New Capabilities
- `frappe-backend-spike`: Proves whether Frappe can serve as Rakhtety's backend engine while preserving a custom Next.js frontend.
- `server-deployment-spike`: Proves whether the user's server can host the proposed Rakhtety stack with basic security, backups, and operational checks.

### Modified Capabilities

## Impact

- Affected systems: current Next.js frontend, current Supabase-backed data model, proposed Frappe/ERPNext backend, user-provided server.
- Affected domains: authentication, roles, workflow dependencies, document uploads, finance tracking, reporting, deployment, backups.
- New dependencies under evaluation: Frappe Framework, optional ERPNext modules, MariaDB, Redis, Bench or Docker deployment, reverse proxy, TLS certificates.
- Security impact: server credentials and production secrets must not be committed; spike must use test data only.
