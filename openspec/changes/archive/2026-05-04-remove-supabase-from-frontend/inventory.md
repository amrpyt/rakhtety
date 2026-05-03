## Supabase Frontend Inventory

Generated during local Frappe migration work on 2026-05-03.

## Remaining Supabase Areas

- `src/app/api/clients/**`
- `src/app/api/employees/**`
- `src/app/api/workflow-documents/upload/route.ts`
- `src/app/api/workflows/**`
- `src/lib/database/repositories/**`
- `src/lib/server-data/**`
- `src/lib/services/*financial*`
- `src/lib/services/document.service.ts`
- `src/lib/services/employee.service.ts`
- `src/lib/services/workflow-action.service.ts`
- `src/lib/auth/server-permissions.ts`
- `src/lib/supabase/**`
- `src/config/database.config.ts`

## Frappe-Mapped Areas In This Round

- Frontend login maps to Frappe `POST /api/method/login`.
- Current user maps to `GET /api/method/rakhtety_frappe.api.current_user`.
- Dashboard summary smoke maps to `rakhtety_frappe.api.get_client_workflow`.
- Client workflow smoke maps to `rakhtety_frappe.api.get_client_workflow`.
- Required document upload maps to `rakhtety_frappe.api.upload_required_document`.
- Step completion maps to `rakhtety_frappe.api.update_step_status`.
- Excavation dependency gate maps to `rakhtety_frappe.api.start_excavation`.
- Employee assigned work maps to `rakhtety_frappe.api.assigned_work`.

## Production Env Cleanup

- `Dockerfile.next` no longer accepts Supabase build args.
- `frappe_apps/docker/production/compose.prod.yml` no longer requires Supabase build/runtime env vars for Next.
- `frappe_apps/docker/production/.env.example` no longer documents Supabase secrets.

## Important Note

This round proves the Frappe-backed auth and spike workflow path locally. The old general app CRUD routes still need route-by-route migration before Supabase can be deleted from the repo.
