## Why

The frontend currently depends on Supabase configuration even though the backend strategy is now Frappe. That creates extra build friction, extra secrets, and a split brain between two data sources. This change removes Supabase from the frontend execution path so the app uses Frappe as the single backend contract.

## What Changes

- Remove Supabase runtime dependency from the frontend data path.
- Replace Supabase-backed repositories, clients, and auth/session helpers with Frappe-backed equivalents or a thin Frappe API adapter.
- Update API routes and services so client, workflow, employee, document, and dashboard data come from Frappe.
- Remove Supabase environment requirements from the production/frontend build path.
- Keep the UI and workflow behavior stable while the data source changes underneath.

## Capabilities

### New Capabilities

- `frappe-frontend-data`: the frontend can read and write workflow data through Frappe without Supabase secrets.

### Modified Capabilities

- `frappe-custom-app`: frontend contract is now Frappe-only for the data path.
- `frappe-production-deployment`: production frontend build no longer requires Supabase env vars.

## Impact

- Affected code: `src/lib/supabase/`, `src/lib/database/`, `src/lib/services/`, `src/app/api/`, `src/hooks/`, `src/providers/`.
- Affected build/runtime config: `.env.local`, production env templates, Docker build args, frontend Dockerfile.
- Affected behavior: authentication/session flow, client/workflow read-write APIs, dashboard summaries, document uploads, employee visibility.
