---
status: fixing
trigger: "Employee clients page shows 0 clients, but employee workflows page shows and opens client workflows, including workflows assigned to other people."
created: "2026-05-02"
updated: "2026-05-02"
---

# Debug Session: employee-client-workflow-scope

## Symptoms

- Expected behavior: employee client visibility and workflow visibility should match the same role/scope rule.
- Actual behavior: employee sees 0 clients on `/clients`, but sees multiple workflows on `/workflows` and can open client files from there.
- Error messages: none seen in browser console.
- Timeline: found during Browser Use employee flow test on 2026-05-02.
- Reproduction: log in as `E2E Office Employee`, open `/clients`, then open `/workflows`.

## Current Focus

- hypothesis: Client list and workflow overview APIs use different access filters.
- test: Compare `/api/clients` and `/api/workflows/overview` server code, permissions, and Supabase queries.
- expecting: One API filters by employee ownership while the other returns all office workflows, or one uses the wrong user id/role source.
- next_action: Return root cause report with exact file/line evidence and smallest safe fix recommendation.
- reasoning_checkpoint:
- tdd_checkpoint:

## Evidence

- timestamp: 2026-05-02
  checked: `.planning/STATE.md`
  found: Recent work included "target role-based admin and employee flows" and "Rebuild workflows page as office queue" with Browser Use admin/employee verification.
  implication: The bug likely lives in the recently added role/scope gates for clients or workflow overview.

- timestamp: 2026-05-02
  checked: search tooling
  found: `rg` failed with Access denied, so investigation must use PowerShell `Get-ChildItem` and `Select-String`.
  implication: Search results may be gathered through fallback tooling, but code can still be inspected.

- timestamp: 2026-05-02
  checked: relevant file discovery
  found: Candidate files include `src/app/api/clients/route.ts`, `src/app/api/workflows/overview/route.ts`, `src/lib/auth/permissions.ts`, `src/lib/auth/server-permissions.ts`, `src/lib/database/repositories/client.repository.ts`, and workflow service/repository files.
  implication: The access mismatch can be tested by comparing route-level permission filters and data-layer query scopes.

- timestamp: 2026-05-02
  checked: `src/app/api/clients/route.ts`
  found: GET creates the normal server Supabase client and returns `listClients(supabase, search)` without a route-level `requirePermission` call or explicit employee filter.
  implication: `/api/clients` visibility is controlled mainly by Supabase RLS and the `listClients` query, not by route code.

- timestamp: 2026-05-02
  checked: `src/lib/server-data/directory-query.ts`
  found: `listClients` selects from `clients`, applies only optional text search, orders by `created_at`, and limits to 50; it has no created_by/assigned workflow filter.
  implication: If employee sees 0 clients, that is coming from live database policy/data shape, not this route intentionally filtering to zero.

- timestamp: 2026-05-02
  checked: `src/app/api/workflows/overview/route.ts`
  found: GET only requires `readClients`, then queries `workflows` with related client, assigned employee, and steps, orders by `updated_at`, and limits to 100; no role-aware `.eq('assigned_to', user.id)` or step assignment filter exists.
  implication: `/api/workflows/overview` is too broad for employees unless RLS restricts rows.

- timestamp: 2026-05-02
  checked: `src/lib/auth/permissions.ts`
  found: Employees have `readClients: true`, `updateWorkflowSteps: true`, `uploadWorkflowDocuments: true`, and `recordPayments: true`, while management actions are false; `/clients` and `/workflows` both route-gate on `readClients`.
  implication: The intended app-level policy is not "employees cannot use workflows"; it is "employees can work, but their row scope must still be constrained."

- timestamp: 2026-05-02
  checked: `supabase/migrations/012_target_role_flow_permissions.sql`
  found: `workflows_select` and `workflow_steps_select` were replaced with `USING (true)` for all authenticated users.
  implication: Supabase RLS currently allows employee sessions to read every workflow and step row, so the broad overview route leaks other people’s work.

- timestamp: 2026-05-02
  checked: `supabase/schema.sql`
  found: The original base schema had narrower workflow policy: admin/manager OR `assigned_to = auth.uid()` for workflows and workflow steps through parent workflow.
  implication: The broad migration is a later regression from a stricter original design.

- timestamp: 2026-05-02
  checked: Browser Use `/api/clients`
  found: Direct employee-session call returned client rows, and `/clients` later rendered 11 clients.
  implication: The persistent bug is not that clients are hidden from the employee; the bug is that workflow overview does not use the employee assignment scope.

## Eliminated

## Resolution

- root_cause: `/api/workflows/overview` is too broad for employee scope. It only checks `readClients`, then returns the latest 100 workflows without filtering by assignee; migration `012_target_role_flow_permissions.sql` also changed workflow and workflow_step SELECT RLS to `USING (true)`, so employees can read workflows/steps assigned to other people. `/api/clients` itself is not too strict in code; the mismatch is caused by workflow overview bypassing the assignment scope that employees should have.
- fix: Applied a role-aware filter in `src/app/api/workflows/overview/route.ts`; employee role now gets only workflows assigned to the current user. Added `supabase/migrations/015_restore_employee_workflow_scope.sql` to restore assigned-workflow SELECT RLS for workflows and workflow steps.
- verification:
- files_changed: [src/app/api/workflows/overview/route.ts, supabase/migrations/015_restore_employee_workflow_scope.sql]
