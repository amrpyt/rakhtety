# Phase 2: Workflow Engine - Context

**Gathered:** 2026-04-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Implement full workflow state machine with database-enforced transitions and dependency gates.

**Requirements:** WF-01, WF-02, WF-03, WF-04, WF-05 (state machine implementation)

**Success Criteria:**
1. Workflow state transitions are database-enforced (no invalid transitions)
2. Excavation Permit workflow is blocked until Device License is COMPLETED
3. Each step shows status, assigned employee, completion date
4. Each step shows government fees and office profit

</domain>

<decisions>
## Implementation Decisions

### State Machine Enforcement
- **D-01:** PostgreSQL triggers for state transition enforcement
  - Reason: DB is source of truth — catches violations from ALL clients (app, API, scripts, backfills)
  - App-level validation as UX layer (user-friendly error messages)
  - Triggers: invisible guards that never sleep

### Step Completion Criteria
- **D-02:** Manual "Mark Complete" button initially
  - Employee clicks → system validates prerequisites → step advances
  - Rationale: Simplest, most controllable; upgrade to automatic later if users find it tedious
  - Automatic on document upload can be added in Phase 4 (Document Management)

### Dependency Gate Behavior
- **D-03:** Grayed out + lock icon + tooltip explanation
  - Step visible but not interactive (shows full workflow scope)
  - Tooltip: "Waiting for Device License completion"
  - Rationale: Transparent, not hidden — users see what's coming
  - NOT: hidden steps (user needs to see full picture), or silent warnings (stakes are high for government permits)

### Financial Config Per Step
- **D-04:** `workflow_step_configs` table with per-step fee/profit
  - Schema: `step_id, government_fee, office_profit, currency`
  - Default values inherited from workflow type (DEVICE_LICENSE, EXCAVATION_PERMIT)
  - Admin can override per step instance if needed
  - Rationale: Flexible, centralizes all financial settings per step

### Break-Glass Override (Future)
- **D-05:** Emergency bypass for privileged users noted for Phase 6 or later
  - Requires audit trail (who overrode, when, why)
  - Lower priority for MVP

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

- `.planning/PROJECT.md` — Project constraints (serverless, Arabic RTL, no Excel)
- `.planning/REQUIREMENTS.md` — v1 requirements (WF-01 through WF-05)
- `rakhtety-erp-demo.html` — Full demo UI with Arabic RTL design (reference for workflow tabs)
- `.planning/phases/01-core-foundation/01-CONTEXT.md` — Phase 1 decisions (DB schema already defined: workflows table with type column, workflow_steps table)

### Research Sources (read for best practices)
- PostgreSQL triggers in 2026 (thelinuxcode.com) — trigger design patterns
- pg-workflows / pgflow.dev — Postgres-native workflow engines
- LogRocket: dependency management in UX — blocked state UX patterns

</canonical_refs>

<codebase_context>
## Existing Code Insights

### From Phase 1
- `workflows` table with `type` column (DEVICE_LICENSE, EXCAVATION_PERMIT) — already exists
- `workflow_steps` table — already exists with: id, workflow_id, step_name, status, assigned_employee, completed_at
- RLS policies for role-based access — already in place

### Reusable Patterns
- Supabase Auth integration already working
- Arabic RTL CSS custom properties (--color-primary, --text-sm, Cairo font)
- Card-based UI with shadows and rounded corners
- Workflow tabs UI (Device License / Excavation Permit) already in demo.html

### Integration Points
- Supabase database for workflow state
- PostgreSQL triggers on `workflow_steps` table for transition enforcement
- Frontend calls Supabase directly (no Edge Functions needed for state machine)

</codebase_context>

<deferred>
## Deferred Ideas

### Phase 4+ (Document Management)
- Automatic step advancement when required documents uploaded
- This extends D-02 (manual → automatic completion)

### Phase 6+ (Polish)
- Break-glass override with audit trail for privileged users
- Add to dependency gate behavior if compliance requirements emerge

### Phase 6+ (Reporting)
- Financial summary per workflow (total fees, total profit, outstanding debt)

</deferred>

---

*Phase: 02-workflow-engine*
*Context gathered: 2026-04-28*