<!-- refreshed: 2026-05-01 -->
# Architecture

**Analysis Date:** 2026-05-01

## System Overview

```text
┌─────────────────────────────────────────────────────────────┐
│                  Next.js App Router UI                       │
├──────────────────┬──────────────────┬───────────────────────┤
│  Auth pages      │  Dashboard pages │  API route handlers    │
│  `src/app/(auth)`│  `src/app/(dashboard)` │ `src/app/api`     │
└────────┬─────────┴────────┬─────────┴──────────┬────────────┘
         │                  │                     │
         ▼                  ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                 Client State and Domain Rules                │
│ `src/hooks`, `src/providers`, `src/lib/services`, `src/lib/domain` │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│              Supabase Data and Storage Access                │
│ `src/lib/database/repositories`, `src/lib/supabase`, `supabase` │
└─────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| Root layout | Sets Arabic RTL document shell and mounts global auth context. | `src/app/layout.tsx` |
| Dashboard layout | Wraps protected dashboard routes in the shared dashboard chrome. | `src/app/(dashboard)/layout.tsx` |
| Middleware | Refreshes Supabase auth cookies and redirects protected/public routes. | `src/middleware.ts` |
| Auth provider | Converts Supabase sessions and profiles into app auth state. | `src/providers/AuthProvider.tsx` |
| Client pages | Render client list, client detail, and report UI. | `src/app/(dashboard)/clients/page.tsx`, `src/app/(dashboard)/clients/[id]/page.tsx`, `src/app/(dashboard)/clients/[id]/report/page.tsx` |
| Workflow UI | Renders workflow tabs, timeline, and step actions. | `src/components/workflow/WorkflowTabs.tsx`, `src/components/workflow/WorkflowStep.tsx`, `src/components/workflow/WorkflowTimeline.tsx` |
| Hooks | Hold React loading/error state and bridge UI actions to fetches/services. | `src/hooks/useClients.ts`, `src/hooks/useWorkflows.ts`, `src/hooks/useFinancials.ts`, `src/hooks/useDocuments.ts` |
| API handlers | Provide Next.js route handlers for auth, clients, workflows, documents, dashboard, and finance. | `src/app/api` |
| Services | Own business rules such as workflow dependency, step transitions, document completion, financial summaries, and employees. | `src/lib/services` |
| Repositories | Wrap Supabase table queries behind typed repository classes. | `src/lib/database/repositories` |
| Supabase clients | Create browser, server-cookie, admin, and middleware Supabase clients. | `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/admin.ts`, `src/lib/supabase/proxy.ts` |
| Domain constants | Store Arabic domain messages, intake document rules, and workflow step templates. | `src/lib/domain/messages.ts`, `src/lib/domain/workflow-templates.ts` |
| Types | Define shared domain types used across UI, hooks, services, and repositories. | `src/types/database.types.ts`, `src/types/auth.types.ts`, `src/types/error-codes.enum.ts` |
| Database schema | Defines Supabase tables, enums, indexes, and RLS policies. | `supabase/schema.sql`, `supabase/migrations` |

## Pattern Overview

**Overall:** Layered Next.js App Router application with a service/repository domain core.

**Key Characteristics:**
- Use `src/app` for route ownership: UI pages live under route groups and HTTP handlers live under `src/app/api`.
- Use hooks in `src/hooks` as the UI bridge for fetching, loading state, errors, and mutations.
- Use services in `src/lib/services` for business rules, not UI components.
- Use repositories in `src/lib/database/repositories` for direct Supabase table reads/writes.
- Use `src/lib/domain` for stable workflow templates, intake document requirements, and messages.
- Use `@/*` and `@lib/*` path aliases from `tsconfig.json`.

## Layers

**Routing and Shell:**
- Purpose: Own URLs, layouts, metadata, and route protection.
- Location: `src/app`, `src/middleware.ts`
- Contains: App Router pages, layouts, route handlers, middleware matcher.
- Depends on: `src/components`, `src/providers/AuthProvider.tsx`, `src/lib/supabase/proxy.ts`.
- Used by: Next.js runtime.

**Presentation Components:**
- Purpose: Render reusable visual pieces for auth, dashboard, clients, documents, employees, finance, layout, and workflows.
- Location: `src/components`
- Contains: Feature components and shared UI primitives.
- Depends on: `src/types`, `src/hooks`, and other components.
- Used by: Pages in `src/app/(auth)` and `src/app/(dashboard)`.

**Client State Hooks:**
- Purpose: Keep React state close to screens and expose simple commands to components.
- Location: `src/hooks`
- Contains: Hooks such as `useClients`, `useWorkflows`, `useEmployees`, `useFinancials`, `useDocuments`, and auth hooks.
- Depends on: `fetch`, `src/lib/client-data/directory-client.ts`, selected services, and `src/hooks/auth/useAuth.ts`.
- Used by: Client components in `src/app/(dashboard)` and `src/components`.

**API Boundary:**
- Purpose: Validate requests, check auth, call Supabase server/admin clients, and return JSON.
- Location: `src/app/api`
- Contains: Route handlers for `/api/auth/*`, `/api/clients`, `/api/clients/[id]/*`, `/api/employees`, `/api/dashboard/summary`, `/api/workflow-documents/upload`, and `/api/workflows/[id]/financial-summary`.
- Depends on: `src/lib/supabase/server.ts`, `src/lib/supabase/admin.ts`, `src/lib/server-data`, `src/lib/domain`, `src/lib/validation`.
- Used by: Browser-side hooks and client helper modules.

**Business Services:**
- Purpose: Enforce application rules and orchestrate repositories.
- Location: `src/lib/services`
- Contains: Client, workflow, workflow action, document, finance, dashboard, employee, and ledger services.
- Depends on: Repositories, domain constants, `src/lib/errors/app-error.class.ts`, shared types.
- Used by: Hooks, API handlers, and tests.

**Data Access:**
- Purpose: Isolate Supabase query details behind typed methods.
- Location: `src/lib/database/repositories`, `src/lib/server-data`, `src/lib/supabase`
- Contains: Repository classes, server query helpers, browser/server/admin Supabase client factories.
- Depends on: Supabase SDK and config in `src/config/database.config.ts`.
- Used by: Services and API handlers.

**Schema and Database Rules:**
- Purpose: Define persistent data, RLS security, functions, indexes, and migrations.
- Location: `supabase/schema.sql`, `supabase/migrations`
- Contains: Tables including `profiles`, `clients`, `workflows`, `workflow_steps`, `employees`, `financial_events`, `workflow_documents`, `client_intake_documents`, `dashboard_alerts`, and `workflow_action_logs`.
- Depends on: Supabase/Postgres.
- Used by: Supabase clients from `src/lib/supabase`.

## Data Flow

### Primary Request Path

1. User opens a dashboard page such as `/clients/[id]` (`src/app/(dashboard)/clients/[id]/page.tsx:1`).
2. `src/middleware.ts` refreshes Supabase session cookies and redirects unauthenticated protected routes (`src/middleware.ts:8`).
3. `AuthProvider` loads the Supabase session, fetches `profiles`, and exposes the current app user (`src/providers/AuthProvider.tsx:17`).
4. The page calls hooks such as `useWorkflows` and `useFinancials` to fetch and mutate screen data (`src/hooks/useWorkflows.ts:21`).
5. Hooks call route handlers such as `/api/clients/[id]/workflows` or services such as `workflowService.updateStepStatus` (`src/hooks/useWorkflows.ts:34`, `src/hooks/useWorkflows.ts:81`).
6. Route handlers and services call Supabase through server clients, admin clients, or repositories (`src/app/api/clients/[id]/workflows/route.ts:8`, `src/lib/services/workflow.service.ts:35`).
7. Repositories query Supabase tables and return typed records (`src/lib/database/repositories/workflow.repository.ts:24`).
8. Hooks update local React state and components rerender workflow, document, and finance UI (`src/components/workflow/WorkflowTabs.tsx`, `src/components/workflow/WorkflowStep.tsx`).

### Client Creation and Intake Documents

1. Client list UI submits client data and optional files through `useClients` (`src/hooks/useClients.ts:21`).
2. `directoryClient.createClient` validates file type and size in the browser, then posts JSON to `/api/clients` (`src/lib/client-data/directory-client.ts:59`).
3. `src/app/api/clients/route.ts` authenticates the user, parses the request, validates with `clientCreateSchema`, creates the client, and stores intake document metadata/files when multipart files are present (`src/app/api/clients/route.ts:45`).
4. The same helper uploads each intake file through `/api/clients/[id]/intake-documents/upload` after JSON client creation (`src/lib/client-data/directory-client.ts:42`).
5. Storage paths are built by document helpers and saved in `client_intake_documents` (`src/lib/services/document-helpers.ts`, `src/app/api/clients/[id]/intake-documents/upload/route.ts`).

### Workflow Creation and Step Updates

1. `useWorkflows.createWorkflow` posts `DEVICE_LICENSE` or `EXCAVATION_PERMIT` to `/api/clients/[id]/workflows` (`src/hooks/useWorkflows.ts:63`).
2. The route handler checks the user, prevents duplicates, blocks excavation until device license completion, inserts the workflow, and inserts template steps (`src/app/api/clients/[id]/workflows/route.ts:44`).
3. The route handler gets step templates from `getWorkflowStepTemplates` (`src/lib/domain/workflow-templates.ts:53`).
4. Step start/complete actions call `workflowService.updateStepStatus`, which delegates to `workflowActionService.apply` (`src/lib/services/workflow.service.ts:79`, `src/lib/services/workflow-action.service.ts:24`).
5. `workflowActionService` validates allowed transitions, checks required documents before completion, updates the step, syncs workflow status, and writes best-effort action logs for emergency/move-back actions (`src/lib/services/workflow-action.service.ts:26`).

### Authentication Flow

1. Login and signup pages render forms in `src/app/(auth)/login/page.tsx` and `src/app/(auth)/signup/page.tsx`.
2. Forms call auth API routes under `src/app/api/auth`.
3. API routes use Supabase auth clients from `src/lib/supabase/server.ts`.
4. `src/middleware.ts` reads user state through `updateSession` from `src/lib/supabase/proxy.ts` and handles redirect behavior.
5. `AuthProvider` keeps browser auth state in sync through `supabase.auth.getSession()` and `supabase.auth.onAuthStateChange()` (`src/providers/AuthProvider.tsx:32`).

**State Management:**
- Global auth state lives in React context at `src/providers/AuthProvider.tsx`.
- Screen data state lives in hooks under `src/hooks`.
- Durable application state lives in Supabase tables defined by `supabase/schema.sql` and migrations under `supabase/migrations`.
- Workflow business state uses `WorkflowStatus` and `StepStatus` from `src/types/database.types.ts`.

## Key Abstractions

**Services:**
- Purpose: Hide business rules behind command-style methods.
- Examples: `src/lib/services/workflow.service.ts`, `src/lib/services/workflow-action.service.ts`, `src/lib/services/client.service.ts`, `src/lib/services/document.service.ts`, `src/lib/services/financial.service.ts`.
- Pattern: Singleton class instance exported at the bottom of the file, for example `export const workflowService = new WorkflowService()`.

**Repositories:**
- Purpose: Hide Supabase table query details.
- Examples: `src/lib/database/repositories/client.repository.ts`, `src/lib/database/repositories/workflow.repository.ts`, `src/lib/database/repositories/workflow-step.repository.ts`, `src/lib/database/repositories/financial.repository.ts`.
- Pattern: Interface plus class plus singleton export, with private `table` constants for table names.

**Route Handlers:**
- Purpose: Serve JSON endpoints and file operations from the Next.js server layer.
- Examples: `src/app/api/clients/route.ts`, `src/app/api/clients/[id]/workflows/route.ts`, `src/app/api/workflow-documents/upload/route.ts`, `src/app/api/workflows/[id]/financial-summary/route.ts`.
- Pattern: Export `GET`, `POST`, or other HTTP functions returning `NextResponse.json`.

**Hooks:**
- Purpose: Expose loading, error, data, and mutation functions to React components.
- Examples: `src/hooks/useClients.ts`, `src/hooks/useWorkflows.ts`, `src/hooks/useEmployees.ts`, `src/hooks/useFinancials.ts`.
- Pattern: `useState`, `useCallback`, and `useEffect` around fetch/service calls.

**Supabase Clients:**
- Purpose: Separate browser, server-cookie, admin/service-role, and middleware session handling.
- Examples: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/admin.ts`, `src/lib/supabase/proxy.ts`.
- Pattern: Use browser client for client components, server client for route handlers/session cookies, admin client only when service-role access is required.

**Domain Templates:**
- Purpose: Keep workflow shape and required intake documents in one domain file.
- Examples: `CLIENT_INTAKE_DOCUMENTS`, `WORKFLOW_STEP_TEMPLATES`, `getWorkflowStepTemplates` in `src/lib/domain/workflow-templates.ts`.
- Pattern: Add workflow/document definitions here before wiring UI or API behavior.

**Typed Domain Model:**
- Purpose: Share data contracts across pages, hooks, services, and repositories.
- Examples: `Workflow`, `WorkflowStep`, `ClientIntakeDocument`, `WorkflowWithSteps` in `src/types/database.types.ts`.
- Pattern: Keep database-shaped interfaces here and import them as `type` where possible.

## Entry Points

**Root Web App:**
- Location: `src/app/layout.tsx`
- Triggers: Every Next.js page request.
- Responsibilities: Defines metadata, `lang="ar"`, `dir="rtl"`, global CSS, and auth provider.

**Landing Redirect:**
- Location: `src/app/page.tsx`
- Triggers: `/`
- Responsibilities: Redirects users into the main app route.

**Auth Routes:**
- Location: `src/app/(auth)/login/page.tsx`, `src/app/(auth)/signup/page.tsx`, `src/app/api/auth/login/route.ts`, `src/app/api/auth/signup/route.ts`, `src/app/api/auth/logout/route.ts`
- Triggers: Login, signup, logout UI and API requests.
- Responsibilities: Authenticate users through Supabase and update browser/server session state.

**Dashboard Routes:**
- Location: `src/app/(dashboard)`
- Triggers: `/dashboard`, `/clients`, `/clients/[id]`, `/clients/[id]/report`, `/employees`, `/employees/[id]`, `/finance`, `/workflows`.
- Responsibilities: Render the operational UI for the office.

**Client API:**
- Location: `src/app/api/clients/route.ts`, `src/app/api/clients/[id]/route.ts`
- Triggers: Client list, search, create, detail, update, and delete requests.
- Responsibilities: Validate client input, enforce auth, handle intake document side effects, and return JSON.

**Workflow API:**
- Location: `src/app/api/clients/[id]/workflows/route.ts`
- Triggers: Workflow list and creation for a client.
- Responsibilities: Load workflows with steps, enforce excavation dependency, create template steps.

**Document API:**
- Location: `src/app/api/workflow-documents/upload/route.ts`, `src/app/api/clients/[id]/intake-documents/upload/route.ts`, `src/app/api/clients/[id]/intake-documents/[documentId]/signed-url/route.ts`
- Triggers: Workflow document upload, intake document upload, preview/download.
- Responsibilities: Validate files, store in Supabase Storage, save document rows, and issue signed URLs.

**Database Schema:**
- Location: `supabase/schema.sql`, `supabase/migrations`
- Triggers: Supabase setup and migration runs.
- Responsibilities: Define database tables, storage rules, RLS policies, indexes, and supporting functions.

## Architectural Constraints

- **Threading:** Next.js request handling and browser React code use the JavaScript event loop. No worker-thread model is present.
- **Global state:** Auth state is global through `src/providers/AuthProvider.tsx`; Supabase browser client is a module-level singleton in `src/lib/supabase/client.ts`; service/repository singletons are exported from `src/lib/services` and `src/lib/database/repositories`.
- **Circular imports:** Not detected from sampled imports. Keep the intended direction: `components/hooks -> services/API -> repositories/supabase`, not the reverse.
- **RTL:** `dir="rtl"` belongs on the root `<html>` in `src/app/layout.tsx`; components should not duplicate page-level direction.
- **Workflow order:** Excavation permit creation must remain blocked until device license is complete. The rule exists in `src/lib/services/workflow.service.ts` and `src/app/api/clients/[id]/workflows/route.ts`.
- **RLS:** Supabase policies in `supabase/schema.sql` use `TO authenticated`; new policies should keep that explicit target.
- **Path aliases:** Use `@/*` for `src/*` and `@lib/*` for `src/lib/*` as configured in `tsconfig.json`.

## Anti-Patterns

### Bypassing Workflow Dependency Rules

**What happens:** Creating an `EXCAVATION_PERMIT` workflow directly in UI code or a repository can skip the device-license dependency.
**Why it's wrong:** The app rule says excavation is locked until device license completion.
**Do this instead:** Use `workflowService.createWithSteps` in `src/lib/services/workflow.service.ts` or mirror the API dependency check in `src/app/api/clients/[id]/workflows/route.ts`.

### Querying Supabase Directly From Feature UI

**What happens:** A page or component imports `supabase` and builds table queries inline.
**Why it's wrong:** Auth, validation, errors, and business rules become scattered across UI files.
**Do this instead:** Put browser-facing calls in `src/lib/client-data`, server queries in `src/lib/server-data`, business rules in `src/lib/services`, and raw table queries in `src/lib/database/repositories`.

### Using Admin Client For Normal Reads

**What happens:** API routes use `createAdminClient` for reads or writes that should respect the current user.
**Why it's wrong:** The admin client uses the service-role key and bypasses normal RLS behavior.
**Do this instead:** Use `createServerClient` from `src/lib/supabase/server.ts` for user-scoped API work and reserve `createAdminClient` in `src/lib/supabase/admin.ts` for storage cleanup or controlled service-role operations.

### Duplicating Domain Labels or Steps

**What happens:** Workflow step names or required intake documents are hard-coded in pages/components.
**Why it's wrong:** UI and backend behavior drift apart when office workflow changes.
**Do this instead:** Use `CLIENT_INTAKE_DOCUMENTS` and `getWorkflowStepTemplates` from `src/lib/domain/workflow-templates.ts`.

## Error Handling

**Strategy:** Use typed domain errors in service code and JSON error payloads in route handlers.

**Patterns:**
- Throw `AppError`, `ValidationError`, and `NotFoundError` from `src/lib/errors/app-error.class.ts` in domain/service code.
- Return `NextResponse.json({ error: message }, { status })` from `src/app/api/**/route.ts`.
- Treat Supabase `PGRST116` as "not found" in repositories such as `src/lib/database/repositories/client.repository.ts` and `src/lib/database/repositories/workflow.repository.ts`.
- Use best-effort audit logging in `src/lib/services/workflow-action.service.ts` when `workflow_action_logs` may not exist yet.

## Cross-Cutting Concerns

**Logging:** Minimal console logging is present; `src/lib/services/workflow-action.service.ts` uses `console.warn` when audit log migration is missing.
**Validation:** API/client validation uses Zod schemas from `src/lib/validation/schemas.ts`, file checks in `src/lib/client-data/directory-client.ts`, and domain validation in services.
**Authentication:** Supabase auth is handled through `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/proxy.ts`, `src/middleware.ts`, and `src/providers/AuthProvider.tsx`.
**Authorization:** Supabase RLS policies live in `supabase/schema.sql` and migrations under `supabase/migrations`.
**Storage:** Supabase Storage document paths and upload behavior are handled by API routes under `src/app/api/**/upload/route.ts` and helpers in `src/lib/services/document-helpers.ts`.
**Styling:** Global styles live in `src/styles/globals.css`; Tailwind config lives in `tailwind.config.ts`; reusable UI primitives live in `src/components/ui`.

---

*Architecture analysis: 2026-05-01*
