# Phase 1: Core Foundation - Context

**Gathered:** 2026-04-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Set up Supabase project, authentication, basic CRM, and workflow UI skeleton. This includes:
- Supabase project setup with Auth enabled
- Email/password authentication with role-based access (Admin, Employee, Manager)
- Client database with search and profile view
- Employee management (CRUD, workflow assignment)
- Workflow UI skeleton for Device License and Excavation Permit tabs

Requirements covered: CRM-01, CRM-02, CRM-03, CRM-04, AUTH-01, AUTH-02, AUTH-03, AUTH-04, WF-01 (UI only), WF-04 (UI only), WF-05 (UI only), EMP-01, EMP-02

</domain>

<decisions>
## Implementation Decisions

### Auth Flow Details
- **D-01:** Session persists until user explicitly logs out (no automatic expiry)
- **D-02:** No email verification or password reset flow (Phase 1 scope)
- **D-03:** Login page UI extracted from `rakhtety-erp-demo.html`
- **D-04:** Authentication via email + password (Supabase Auth)

### Database Schema Approach
- **D-05:** Single `workflows` table with `type` column (DEVICE_LICENSE / EXCAVATION_PERMIT) — normalized, best practice
- **D-06:** Separate `workflow_steps` table — enterprise best practice for step-level tracking, dependencies, and assignments
- **D-07:** Row-Level Security (RLS) uses role-based policies — employees see only assigned workflows, admins see all

### CRM Search Implementation
- **D-08:** Supabase full-text search — built-in, sufficient for MVP (search by name, phone, parcel number)

### Frontend Stack — SPA vs Framework
- **D-09:** Next.js + React framework — better for ERP complexity, SSR, API routes
- **D-10:** UI components extracted from `rakhtety-erp-demo.html` — start with demo styling as foundation, then enhance

### Agent's Discretion
- Exact component extraction strategy from demo.html
- CSS variable mapping from demo to Next.js/React format
- Login page form validation details

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

- `rakhtety-erp-demo.html` — Full demo UI with Arabic RTL design, Nexus-style components, Cairo font. Login page design, sidebar navigation, and workflow tabs to extract.
- `.planning/PROJECT.md` — Project constraints (serverless, Arabic RTL, no Excel)
- `.planning/REQUIREMENTS.md` — v1 requirements mapped to Phase 1 (CRM-01 through CRM-04, AUTH-01 through AUTH-04, EMP-01, EMP-02, WF-01 UI, WF-04 UI, WF-05 UI)

</canonical_refs>

<codebase_context>
## Existing Code Insights

### Reusable Assets
- `rakhtety-erp-demo.html` — Complete HTML/CSS/JS demo with sidebar, cards, buttons, form inputs, workflow tabs (Device License / Excavation Permit), client profile UI, employee management UI

### Established Patterns
- CSS custom properties for theming (`--color-primary`, `--text-sm`, etc.)
- Cairo font for Arabic text
- RTL layout with `dir="rtl"`
- Card-based UI with shadows and rounded corners

### Integration Points
- Supabase Auth for authentication
- Supabase database for CRM and workflow storage
- RLS policies for access control

</codebase_context>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 1 scope.

</deferred>

---

*Phase: 01-core-foundation*
*Context gathered: 2026-04-28*