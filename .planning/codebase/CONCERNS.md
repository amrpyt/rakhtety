# Codebase Concerns

**Analysis Date:** 2026-05-01

## Tech Debt

**Repository layer depends on the browser Supabase singleton:**
- Issue: Shared repositories import `supabase` from `src/lib/supabase/client.ts`, which is built with `createBrowserClient`. The same repositories are used by server-side services such as `src/lib/services/dashboard-summary.service.ts`.
- Files: `src/lib/supabase/client.ts`, `src/lib/database/repositories/client.repository.ts`, `src/lib/database/repositories/workflow.repository.ts`, `src/lib/database/repositories/workflow-step.repository.ts`, `src/lib/database/repositories/document.repository.ts`, `src/lib/database/repositories/employee.repository.ts`, `src/lib/database/repositories/financial.repository.ts`, `src/lib/services/dashboard-summary.service.ts`
- Impact: Server code can run without the request cookies needed for Row Level Security decisions, so queries may return empty data, inconsistent data, or depend on client-side session state in places that should be deterministic.
- Fix approach: Split repository construction from the Supabase client. Pass a request-scoped server client from `src/lib/supabase/server.ts` into repositories used by API routes and server services, and keep `src/lib/supabase/client.ts` only for client components/hooks.

**Business rules are duplicated between services and API routes:**
- Issue: Workflow creation uses `src/lib/services/workflow.service.ts` in one path, but `src/app/api/clients/[id]/workflows/route.ts` reimplements dependency checks, workflow inserts, and step creation directly with the admin client.
- Files: `src/lib/services/workflow.service.ts`, `src/app/api/clients/[id]/workflows/route.ts`, `src/lib/domain/workflow-templates.ts`, `src/lib/domain/messages.ts`
- Impact: Fixes to workflow ordering, default step fees, or dependency messages can land in one path and not the other.
- Fix approach: Route all workflow creation through `WorkflowService.createWithSteps`, and make that service accept the authenticated actor and request-scoped Supabase client instead of bypassing the layer with `createAdminClient`.

**Large page components mix UI, data loading, and document preview logic:**
- Issue: `src/app/(dashboard)/clients/[id]/page.tsx` is 479 lines and contains client loading, intake document signed URL calls, preview modal logic, current task logic, and the full page layout in one file.
- Files: `src/app/(dashboard)/clients/[id]/page.tsx`, `src/app/(dashboard)/clients/page.tsx`, `src/components/documents/DocumentUploadPanel.tsx`, `src/components/workflow/WorkflowStep.tsx`
- Impact: Small UI changes are risky because state and network behavior sit inside the same large component tree.
- Fix approach: Extract `ClientIntakeDocumentsCard`, `CurrentTaskPanel`, and page data loading into focused components/hooks under `src/components/clients/` and `src/hooks/`.

**Schema source is not safe as a fresh database baseline:**
- Issue: `supabase/schema.sql` defines `profiles.email` twice.
- Files: `supabase/schema.sql`
- Impact: Applying `supabase/schema.sql` to a new database fails before migrations can run, so fresh setup and disaster recovery are fragile.
- Fix approach: Remove the duplicate column from `supabase/schema.sql` and keep the schema dump synchronized with the migration chain.

## Known Bugs

**Any signed-in user can create workflows for any client through the API route:**
- Symptoms: `POST /api/clients/[id]/workflows` authenticates the user, then uses `createAdminClient()` to read clients and insert workflows/steps without checking that the user is an admin, manager, creator, or assigned employee for that client.
- Files: `src/app/api/clients/[id]/workflows/route.ts`, `src/lib/supabase/admin.ts`, `supabase/schema.sql`
- Trigger: Sign in as any authenticated employee and call `POST /api/clients/{clientId}/workflows` with `{ "type": "DEVICE_LICENSE" }` for a client outside that employee's assignment.
- Workaround: None in the route. Database RLS is bypassed because the route uses the service role client.

**Workflow document upload accepts mismatched workflow and step ids:**
- Symptoms: `src/app/api/workflow-documents/upload/route.ts` trusts both `workflow_id` and `workflow_step_id` from the form, checks permission only against `workflow_id`, then inserts both values with the admin client.
- Files: `src/app/api/workflow-documents/upload/route.ts`, `supabase/migrations/006_create_workflow_documents.sql`, `supabase/migrations/007_harden_workflow_document_storage.sql`
- Trigger: Submit a document where `workflow_id` belongs to an allowed workflow, but `workflow_step_id` belongs to another workflow. The database has separate foreign keys, not a composite constraint proving the step belongs to the workflow.
- Workaround: None detected. The route should query the step with `.eq('id', workflowStepId).eq('workflow_id', workflowId)` before upload and add a database-level composite guard.

**Dashboard API depends on repositories that use the browser Supabase client:**
- Symptoms: `GET /api/dashboard/summary` calls `dashboardService.getSummary()`, which reaches repositories that import `src/lib/supabase/client.ts`.
- Files: `src/app/api/dashboard/summary/route.ts`, `src/lib/services/dashboard.service.ts`, `src/lib/services/dashboard-summary.service.ts`, `src/lib/supabase/client.ts`
- Trigger: Load `/api/dashboard/summary` on the server when the browser client has no request-bound auth state.
- Workaround: Use direct request-scoped query helpers like `src/lib/server-data/directory-query.ts` until repositories accept a server client.

## Security Considerations

**Public signup creates confirmed users through the service role:**
- Risk: `/api/auth/signup` is under the public auth route group and calls `admin.auth.admin.createUser` with `email_confirm: true`.
- Files: `src/app/api/auth/signup/route.ts`, `src/middleware.ts`, `src/lib/supabase/admin.ts`
- Current mitigation: New users are forced to the `employee` role in `src/app/api/auth/signup/route.ts`.
- Recommendations: Add invite-only signup, admin approval, rate limiting, or CAPTCHA before creating confirmed users with the service role.

**Broad read policies expose office data to all authenticated users:**
- Risk: Several RLS policies use `USING (true)` for authenticated users, including clients, profiles, employees, and client intake document metadata.
- Files: `supabase/schema.sql`, `supabase/migrations/014_create_client_intake_documents.sql`
- Current mitigation: Sensitive file access for intake documents is mediated by `src/app/api/clients/[id]/intake-documents/[documentId]/signed-url/route.ts`, and workflow document storage policies are hardened in `supabase/migrations/007_harden_workflow_document_storage.sql`.
- Recommendations: Scope client, profile, employee, and intake document metadata reads by role and assignment. Keep `TO authenticated` but avoid `USING (true)` for private office data.

**Service role usage is spread through route handlers:**
- Risk: API routes use `createAdminClient()` directly for workflow creation, document upload, intake upload, signed URL generation, and signup. A missing authorization check in any route bypasses RLS completely.
- Files: `src/app/api/auth/signup/route.ts`, `src/app/api/clients/route.ts`, `src/app/api/clients/[id]/workflows/route.ts`, `src/app/api/workflow-documents/upload/route.ts`, `src/app/api/clients/[id]/intake-documents/upload/route.ts`, `src/app/api/clients/[id]/intake-documents/[documentId]/signed-url/route.ts`, `src/lib/supabase/admin.ts`
- Current mitigation: Some routes manually check `profile.role`, `client.created_by`, or `workflow.assigned_to`.
- Recommendations: Centralize authorization helpers for `canManageClient`, `canManageWorkflow`, and `canViewDocument`, then require those helpers before every admin-client operation.

## Performance Bottlenecks

**Dashboard summary performs N+1 workflow detail queries:**
- Problem: `summarizeManagerDashboard` fetches all workflows, then for each workflow separately fetches the client and workflow steps.
- Files: `src/lib/services/dashboard-summary.service.ts`, `src/lib/database/repositories/workflow.repository.ts`, `src/lib/database/repositories/client.repository.ts`, `src/lib/database/repositories/workflow-step.repository.ts`
- Cause: The service composes generic repositories instead of using one joined query for dashboard shape.
- Improvement path: Add a dashboard-specific query in `src/lib/server-data/` that selects workflows with client and step data in one request, then compute analytics from that result.

**Office ledger summary performs per-workflow financial queries:**
- Problem: `summarizeOfficeLedger` loads workflows and events, then calls `summarizeWorkflowLedger` once per workflow; each call fetches workflow, steps, and events again.
- Files: `src/lib/server-data/financial-summary-query.ts`, `src/lib/services/ledger-summary.service.ts`
- Cause: Aggregation is implemented as repeated per-workflow reads.
- Improvement path: Fetch all workflow steps and financial events once, group them in memory by `workflow_id`, or move aggregation into a database view/RPC.

**Client search builds raw OR filters from user input:**
- Problem: Search strings are interpolated into Supabase `.or(...)` filters.
- Files: `src/lib/server-data/directory-query.ts`, `src/lib/database/repositories/client.repository.ts`
- Cause: The code builds PostgREST filter text manually.
- Improvement path: Escape PostgREST special characters or replace ad hoc filters with a database function/search endpoint that receives a plain parameter.

## Fragile Areas

**Workflow state transitions rely on multiple client-visible checks:**
- Files: `src/lib/services/workflow-action.service.ts`, `src/lib/database/repositories/workflow-step.repository.ts`, `supabase/migrations/002_add_workflow_step_state.sql`
- Why fragile: The repository checks transitions in TypeScript and the database also has transition enforcement. Emergency completion intentionally ignores missing required documents, then logs best-effort.
- Safe modification: Change transition rules in `VALID_TRANSITIONS`, the database trigger/function migration, and `WorkflowActionService` together.
- Test coverage: `src/lib/database/repositories/workflow-step.repository.test.ts` and `src/lib/services/workflow.service.test.ts` cover some workflow behavior, but API-level route tests for emergency completion and move-back are not detected.

**Document completion depends on step names as lookup keys:**
- Files: `src/lib/services/document.service.ts`, `supabase/migrations/006_create_workflow_documents.sql`, `supabase/migrations/010_align_real_office_workflow.sql`, `src/lib/domain/workflow-templates.ts`
- Why fragile: Required document rules are matched by `step_name`, so renaming a workflow step can silently disconnect requirements from that step.
- Safe modification: Add stable step codes to templates and requirements, then match by code instead of Arabic display text.
- Test coverage: `src/lib/services/document.service.test.ts` covers document service behavior, but migration/template consistency tests are not detected.

**Arabic text appears directly in many source files and migrations:**
- Files: `src/app/(dashboard)/clients/[id]/page.tsx`, `src/components/workflow/WorkflowStep.tsx`, `src/lib/domain/messages.ts`, `supabase/migrations/006_create_workflow_documents.sql`, `supabase/migrations/010_align_real_office_workflow.sql`
- Why fragile: UI copy, database seed values, and workflow matching are coupled to literal display text.
- Safe modification: Keep display text in one domain/config module and use stable internal identifiers for workflow logic and document requirements.
- Test coverage: No localization or encoding regression tests are detected.

## Scaling Limits

**Dashboard reads are bounded by current small-office data volume:**
- Current capacity: No explicit cap is enforced for `workflowRepository.findAll()` in `src/lib/database/repositories/workflow.repository.ts`.
- Limit: Dashboard latency grows with every workflow because client, step, and ledger details are loaded per workflow.
- Scaling path: Add pagination for raw lists and pre-aggregated dashboard queries for summary data.

**File upload limits are app-side and bucket-side, but request volume is not throttled:**
- Current capacity: `src/lib/services/document-helpers.ts` limits documents to 10 MB and `supabase/migrations/007_harden_workflow_document_storage.sql` sets the same bucket file size limit.
- Limit: Repeated uploads can still consume API/server resources and storage attempts because no route-level rate limiting is detected.
- Scaling path: Add per-user upload rate limits and audit failed uploads in `src/app/api/workflow-documents/upload/route.ts` and `src/app/api/clients/[id]/intake-documents/upload/route.ts`.

## Dependencies at Risk

**Next.js 16 with OpenNext Cloudflare is a moving deployment surface:**
- Risk: The app depends on `next` `^16.2.4` and `@opennextjs/cloudflare` `^1.19.5`, while project state notes Cloudflare deployment sensitivity around Next/OpenNext compatibility.
- Impact: Build, preview, or deploy can fail when either package updates under the caret range.
- Migration plan: Pin exact versions in `package.json` before production deployment, and keep `pnpm-lock.yaml` as the source of truth for release builds.

**TypeScript 6 and React 19 are very new dependency choices:**
- Risk: `typescript` `^6.0.3`, `react` `^19.2.5`, and `react-dom` `^19.2.5` can expose tooling/plugin compatibility gaps.
- Impact: ESLint, Next typegen, Vitest, and deployment adapters can break on minor updates.
- Migration plan: Pin versions for the current milestone and run `pnpm lint`, `pnpm test`, `pnpm typecheck`, and deployment preview after dependency updates.

## Missing Critical Features

**No detected centralized authorization layer:**
- Problem: Authorization is hand-coded per API route.
- Blocks: Safe expansion of client ownership, manager permissions, document access, and employee workflows.

**No detected end-to-end tests for protected dashboard workflows:**
- Problem: Tests exist for selected services and one clients route, but Browser Use/E2E coverage is not represented as committed tests.
- Blocks: Confident changes to login handoff, client workflow creation, document upload, and report generation.

**No detected migration smoke test for a fresh Supabase database:**
- Problem: `supabase/schema.sql` and migrations are not validated by a local reset/check script in `package.json`.
- Blocks: Safe onboarding, restore testing, and production migration confidence.

## Test Coverage Gaps

**Service-role API routes:**
- What's not tested: Signup, workflow creation, workflow document upload, intake document upload, signed URL generation, and financial summary routes.
- Files: `src/app/api/auth/signup/route.ts`, `src/app/api/clients/[id]/workflows/route.ts`, `src/app/api/workflow-documents/upload/route.ts`, `src/app/api/clients/[id]/intake-documents/upload/route.ts`, `src/app/api/clients/[id]/intake-documents/[documentId]/signed-url/route.ts`, `src/app/api/workflows/[id]/financial-summary/route.ts`
- Risk: Auth bypass, RLS bypass, and broken document ownership checks can ship unnoticed.
- Priority: High

**Dashboard server data path:**
- What's not tested: `GET /api/dashboard/summary` with an authenticated request-scoped Supabase client.
- Files: `src/app/api/dashboard/summary/route.ts`, `src/lib/services/dashboard-summary.service.ts`, `src/lib/supabase/client.ts`
- Risk: Dashboard can show empty or incorrect metrics while service-level pure analytics tests still pass.
- Priority: High

**Database schema and migration integrity:**
- What's not tested: Fresh application of `supabase/schema.sql` and the migration sequence.
- Files: `supabase/schema.sql`, `supabase/migrations/002_add_workflow_step_state.sql`, `supabase/migrations/006_create_workflow_documents.sql`, `supabase/migrations/014_create_client_intake_documents.sql`
- Risk: New environments can fail at setup or drift from production.
- Priority: High

**Large client detail workflow UI:**
- What's not tested: The full browser path for opening a client, creating device license/excavation workflows, uploading required documents, previewing intake documents, and generating reports.
- Files: `src/app/(dashboard)/clients/[id]/page.tsx`, `src/components/workflow/WorkflowTabs.tsx`, `src/components/workflow/WorkflowStep.tsx`, `src/components/documents/DocumentUploadPanel.tsx`
- Risk: Regressions in the main office workflow reach users before detection.
- Priority: Medium

---

*Concerns audit: 2026-05-01*
