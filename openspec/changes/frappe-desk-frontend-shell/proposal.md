## Why

Rakhtety is moving toward a Frappe-backed backend, but the current frontend still looks and behaves like a custom operations dashboard. The office needs the same system flow with a frontend that feels close to ERPNext/Frappe Desk so users get familiar navigation, dense work lists, and document-style screens while keeping the existing Next.js app.

## What Changes

- Introduce a Frappe Desk-inspired dashboard shell with persistent module sidebar, top awesomebar-style search/action area, compact workspace cards, and dense list/form surfaces.
- Restyle shared UI primitives so lists, cards, buttons, badges, and page chrome match the quiet ERP desk pattern instead of the current decorative operations palette.
- Apply the shell to existing dashboard routes without changing the current backend contracts or workflow business rules.
- Preserve Arabic RTL behavior, role-based navigation visibility, and the Device License before Excavation Permit dependency.
- Add Browser Use verification tasks for key frontend routes after implementation.

## Capabilities

### New Capabilities

- `frappe-desk-frontend-shell`: Covers the ERPNext/Frappe Desk-like frontend shell, shared visual system, and route-level UX expectations.

### Modified Capabilities

- `dashboard-shell-hydration`: The shell remains auth-stable during hydration while changing layout and visual treatment.
- `frappe-frontend-data`: Existing data screens keep their Frappe/Supabase abstraction contract while the presentation moves toward Frappe Desk.

## Impact

- Affected code: `src/styles/globals.css`, `src/components/layout/*`, shared UI components, and dashboard pages under `src/app/(dashboard)/`.
- Affected behavior: visual layout, navigation density, page headers, table/list ergonomics, and mobile navigation treatment.
- Not affected: backend data model, Frappe DocTypes, Supabase/Frappe adapters, auth rules, API payloads, workflow dependency logic, and document upload logic.
- Research inputs: Frappe Desk docs for Workspace, Awesomebar, List View, Form View, sidebar, timeline, and Frappe REST/API conventions.
