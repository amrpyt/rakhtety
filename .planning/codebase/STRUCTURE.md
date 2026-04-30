# Codebase Structure

**Analysis Date:** 2026-05-01

## Directory Layout

```text
rakhtety/
├── .agents/                 # Local non-GSD agent skills
├── .codex/                  # Local GSD skills, commands, and agent workflow assets
├── .planning/               # GSD state, phase plans, requirements, and codebase maps
├── docs/                    # Agent-facing repo docs
├── public/                  # Static assets served by Next.js
├── src/                     # Application source code
│   ├── app/                 # Next.js App Router pages, layouts, and API routes
│   ├── components/          # Reusable React components and UI primitives
│   ├── config/              # Runtime config wrappers
│   ├── hooks/               # React state/data hooks
│   ├── lib/                 # Domain, services, repositories, Supabase, validation
│   ├── providers/           # React context providers
│   ├── styles/              # Global CSS
│   └── types/               # Shared TypeScript domain types
├── supabase/                # Database schema and migrations
├── package.json             # Scripts and dependencies
├── pnpm-lock.yaml           # pnpm lockfile
├── next.config.mjs          # Next.js config
├── open-next.config.ts      # OpenNext Cloudflare config
├── wrangler.jsonc           # Cloudflare Wrangler config
├── tsconfig.json            # TypeScript config and path aliases
├── vitest.config.ts         # Vitest test config
├── eslint.config.mjs        # ESLint config
├── tailwind.config.ts       # Tailwind CSS config
└── rakhtety-erp-demo.html   # UI reference design
```

## Directory Purposes

**`src/app`:**
- Purpose: Own URL structure, layouts, pages, and API route handlers.
- Contains: Route groups `src/app/(auth)` and `src/app/(dashboard)`, API routes under `src/app/api`, root layout/page files.
- Key files: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/(dashboard)/layout.tsx`, `src/app/api/clients/route.ts`.

**`src/app/(auth)`:**
- Purpose: Public auth pages.
- Contains: `login` and `signup` route folders.
- Key files: `src/app/(auth)/login/page.tsx`, `src/app/(auth)/signup/page.tsx`.

**`src/app/(dashboard)`:**
- Purpose: Protected operational dashboard screens.
- Contains: Client, employee, finance, workflow, dashboard, and report pages.
- Key files: `src/app/(dashboard)/dashboard/page.tsx`, `src/app/(dashboard)/clients/page.tsx`, `src/app/(dashboard)/clients/[id]/page.tsx`, `src/app/(dashboard)/finance/page.tsx`.

**`src/app/api`:**
- Purpose: JSON and file endpoints used by client-side hooks/components.
- Contains: Auth, clients, workflows, documents, employees, dashboard summary, and financial summary route handlers.
- Key files: `src/app/api/auth/login/route.ts`, `src/app/api/clients/route.ts`, `src/app/api/clients/[id]/workflows/route.ts`, `src/app/api/workflow-documents/upload/route.ts`.

**`src/components`:**
- Purpose: React UI building blocks split by feature.
- Contains: `auth`, `client`, `dashboard`, `documents`, `employees`, `financial`, `layout`, `ui`, and `workflow` component groups.
- Key files: `src/components/layout/DashboardLayout.tsx`, `src/components/layout/Sidebar.tsx`, `src/components/workflow/WorkflowStep.tsx`, `src/components/ui/Button.tsx`.

**`src/components/ui`:**
- Purpose: Shared UI primitives.
- Contains: Buttons, cards, alerts, badges, dialogs, forms, tables, tabs, search, empty/loading states.
- Key files: `src/components/ui/Button.tsx`, `src/components/ui/Card.tsx`, `src/components/ui/Form.tsx`, `src/components/ui/Dialog.tsx`.

**`src/config`:**
- Purpose: Runtime config access with required env-var checks.
- Contains: Auth and database config modules.
- Key files: `src/config/database.config.ts`, `src/config/auth.config.ts`.

**`src/hooks`:**
- Purpose: UI-facing data hooks and auth hooks.
- Contains: Client, employee, workflow, document, dashboard, financial hooks plus `src/hooks/auth`.
- Key files: `src/hooks/useClients.ts`, `src/hooks/useWorkflows.ts`, `src/hooks/useFinancials.ts`, `src/hooks/auth/useAuth.ts`.

**`src/lib`:**
- Purpose: Non-UI application code.
- Contains: Auth helpers, client/server data helpers, repositories, domain constants, errors, services, Supabase clients, validation.
- Key files: `src/lib/services/workflow.service.ts`, `src/lib/database/repositories/client.repository.ts`, `src/lib/supabase/server.ts`, `src/lib/domain/workflow-templates.ts`.

**`src/lib/auth`:**
- Purpose: Auth user mapping.
- Contains: Helpers that convert Supabase users/profiles into app auth types.
- Key files: `src/lib/auth/auth-user.ts`.

**`src/lib/client-data`:**
- Purpose: Browser-side API client helpers.
- Contains: Fetch wrappers for client directory and intake document operations.
- Key files: `src/lib/client-data/directory-client.ts`.

**`src/lib/server-data`:**
- Purpose: Server-side query helpers used by route handlers/pages.
- Contains: Supabase query functions for directory and financial summaries.
- Key files: `src/lib/server-data/directory-query.ts`, `src/lib/server-data/financial-summary-query.ts`.

**`src/lib/database/repositories`:**
- Purpose: Repository classes for direct Supabase table access.
- Contains: Client, workflow, step, document, employee, profile, finance, dashboard alert, and workflow action log repositories.
- Key files: `src/lib/database/repositories/workflow.repository.ts`, `src/lib/database/repositories/workflow-step.repository.ts`, `src/lib/database/repositories/financial.repository.ts`.

**`src/lib/domain`:**
- Purpose: Stable domain language and workflow constants.
- Contains: Arabic messages, blocked workflow reason helpers, workflow step templates, required intake document definitions.
- Key files: `src/lib/domain/messages.ts`, `src/lib/domain/workflow-templates.ts`.

**`src/lib/errors`:**
- Purpose: Shared application error classes.
- Contains: `AppError`, `AuthError`, `ValidationError`, and `NotFoundError`.
- Key files: `src/lib/errors/app-error.class.ts`.

**`src/lib/services`:**
- Purpose: Business logic and orchestration.
- Contains: Client, workflow, workflow action, document, finance, dashboard, employee, ledger, and calculation services.
- Key files: `src/lib/services/workflow.service.ts`, `src/lib/services/workflow-action.service.ts`, `src/lib/services/document.service.ts`, `src/lib/services/financial.service.ts`.

**`src/lib/supabase`:**
- Purpose: Supabase client factories for each runtime context.
- Contains: Browser, server-cookie, admin/service-role, and middleware proxy clients.
- Key files: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/admin.ts`, `src/lib/supabase/proxy.ts`.

**`src/lib/validation`:**
- Purpose: Request/input validation schemas.
- Contains: Zod schemas for app inputs.
- Key files: `src/lib/validation/schemas.ts`.

**`src/providers`:**
- Purpose: React context providers.
- Contains: Auth provider and auth context access.
- Key files: `src/providers/AuthProvider.tsx`.

**`src/styles`:**
- Purpose: Global styling and design tokens.
- Contains: Global CSS imported by the root layout.
- Key files: `src/styles/globals.css`.

**`src/types`:**
- Purpose: Shared TypeScript types and enums.
- Contains: Auth types, database domain interfaces, error code enum.
- Key files: `src/types/database.types.ts`, `src/types/auth.types.ts`, `src/types/error-codes.enum.ts`.

**`supabase`:**
- Purpose: Database schema and migration history.
- Contains: `schema.sql` plus numbered SQL migrations.
- Key files: `supabase/schema.sql`, `supabase/migrations/010_align_real_office_workflow.sql`, `supabase/migrations/014_create_client_intake_documents.sql`.

**`.planning`:**
- Purpose: GSD planning state and generated codebase docs.
- Contains: Project state, requirements, phase plans, and codebase maps.
- Key files: `.planning/STATE.md`, `.planning/REQUIREMENTS.md`, `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/STRUCTURE.md`.

**`docs/agents`:**
- Purpose: Agent operating notes for issue tracker, triage labels, and domain docs.
- Contains: Markdown instructions for future agents.
- Key files: `docs/agents/domain.md`, `docs/agents/issue-tracker.md`, `docs/agents/triage-labels.md`.

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root HTML shell, global CSS import, RTL setup, and `AuthProvider`.
- `src/app/page.tsx`: Root route behavior.
- `src/app/(dashboard)/layout.tsx`: Dashboard shell wrapper.
- `src/middleware.ts`: Supabase session refresh and protected-route redirects.
- `src/app/api/*/route.ts`: HTTP endpoint entry points.

**Configuration:**
- `package.json`: Scripts, dependencies, and pnpm package manager declaration.
- `tsconfig.json`: Strict TypeScript config and aliases `@/*`, `@lib/*`.
- `next.config.mjs`: Next.js config.
- `open-next.config.ts`: OpenNext Cloudflare adapter config.
- `wrangler.jsonc`: Cloudflare deployment config.
- `vitest.config.ts`: Test config.
- `eslint.config.mjs`: Lint config.
- `tailwind.config.ts`: Tailwind config.
- `src/config/database.config.ts`: Supabase env-var access and auth session settings.
- `src/config/auth.config.ts`: Auth role/session config.

**Core Logic:**
- `src/lib/services/client.service.ts`: Client validation and CRUD orchestration.
- `src/lib/services/workflow.service.ts`: Workflow creation, dependency check, status updates.
- `src/lib/services/workflow-action.service.ts`: Step transition rules, document checks, action logs.
- `src/lib/services/document.service.ts`: Workflow document requirements and completion checks.
- `src/lib/services/financial.service.ts`: Financial event and summary behavior.
- `src/lib/services/dashboard-analytics.ts`: Dashboard metrics and summaries.
- `src/lib/domain/workflow-templates.ts`: Workflow step and intake document definitions.
- `src/lib/domain/messages.ts`: Domain messages and blocked-workflow reason helpers.

**Data Access:**
- `src/lib/database/repositories/client.repository.ts`: `clients` table access.
- `src/lib/database/repositories/workflow.repository.ts`: `workflows` and workflow-with-steps access.
- `src/lib/database/repositories/workflow-step.repository.ts`: `workflow_steps` and step config access.
- `src/lib/database/repositories/document.repository.ts`: Workflow document table access.
- `src/lib/database/repositories/financial.repository.ts`: Financial events and summaries.
- `src/lib/server-data/directory-query.ts`: Server-side client/employee list queries.
- `src/lib/server-data/financial-summary-query.ts`: Server-side financial summary query helpers.
- `src/lib/supabase/client.ts`: Browser Supabase client.
- `src/lib/supabase/server.ts`: Server route/component Supabase client with cookies.
- `src/lib/supabase/admin.ts`: Service-role Supabase client.
- `src/lib/supabase/proxy.ts`: Middleware Supabase session updater.

**UI:**
- `src/components/layout/DashboardLayout.tsx`: Dashboard wrapper.
- `src/components/layout/Sidebar.tsx`: Main navigation.
- `src/components/client/ClientCard.tsx`: Client card component.
- `src/components/client/ClientTable.tsx`: Client table component.
- `src/components/workflow/WorkflowTabs.tsx`: Workflow path tabs.
- `src/components/workflow/WorkflowStep.tsx`: Step action UI.
- `src/components/documents/DocumentUploadPanel.tsx`: Workflow document upload UI.
- `src/components/financial/FinancialSummaryCard.tsx`: Financial summary card.
- `src/components/financial/PaymentForm.tsx`: Payment entry form.
- `src/components/ui/*`: Shared UI primitives.

**Routes:**
- `src/app/(auth)/login/page.tsx`: Login page.
- `src/app/(auth)/signup/page.tsx`: Signup page.
- `src/app/(dashboard)/dashboard/page.tsx`: Dashboard home.
- `src/app/(dashboard)/clients/page.tsx`: Client list and client creation.
- `src/app/(dashboard)/clients/[id]/page.tsx`: Client detail, workflows, documents, finance.
- `src/app/(dashboard)/clients/[id]/report/page.tsx`: Client report page.
- `src/app/(dashboard)/employees/page.tsx`: Employee list.
- `src/app/(dashboard)/employees/[id]/page.tsx`: Employee detail.
- `src/app/(dashboard)/finance/page.tsx`: Finance dashboard.
- `src/app/(dashboard)/workflows/page.tsx`: Workflow overview.

**API:**
- `src/app/api/auth/login/route.ts`: Login endpoint.
- `src/app/api/auth/logout/route.ts`: Logout endpoint.
- `src/app/api/auth/signup/route.ts`: Signup endpoint.
- `src/app/api/clients/route.ts`: List/search/create clients.
- `src/app/api/clients/[id]/route.ts`: Single client read/update/delete.
- `src/app/api/clients/[id]/workflows/route.ts`: Client workflow list/create.
- `src/app/api/clients/[id]/report/route.ts`: Client report data.
- `src/app/api/clients/[id]/intake-documents/upload/route.ts`: Client intake document upload.
- `src/app/api/clients/[id]/intake-documents/[documentId]/signed-url/route.ts`: Intake document preview/download URL.
- `src/app/api/workflow-documents/upload/route.ts`: Workflow step document upload.
- `src/app/api/workflows/[id]/financial-summary/route.ts`: Workflow financial summary.
- `src/app/api/dashboard/summary/route.ts`: Dashboard summary.
- `src/app/api/employees/route.ts`: Employee list/create.

**Database:**
- `supabase/schema.sql`: Base schema, RLS policies, and core indexes.
- `supabase/migrations/002_add_workflow_step_state.sql`: Step state changes.
- `supabase/migrations/003_create_workflow_step_configs.sql`: Workflow step configs.
- `supabase/migrations/005_create_financial_events.sql`: Financial event table.
- `supabase/migrations/006_create_workflow_documents.sql`: Workflow document table/storage setup.
- `supabase/migrations/008_create_dashboard_alerts.sql`: Dashboard alerts.
- `supabase/migrations/009_create_workflow_action_logs.sql`: Workflow action logs.
- `supabase/migrations/014_create_client_intake_documents.sql`: Client intake documents.

**Testing:**
- `vitest.config.ts`: Test runner config.
- `src/app/api/clients/route.test.ts`: Client API tests.
- `src/lib/database/repositories/workflow-step.repository.test.ts`: Workflow step repository tests.
- `src/lib/services/dashboard-analytics.test.ts`: Dashboard analytics tests.
- `src/lib/services/document.service.test.ts`: Document service tests.
- `src/lib/services/financial.service.test.ts`: Financial service tests.
- `src/lib/services/workflow.service.test.ts`: Workflow service tests.

## Naming Conventions

**Files:**
- Next.js route files use framework names: `page.tsx`, `layout.tsx`, `route.ts`.
- React components use PascalCase: `src/components/workflow/WorkflowStep.tsx`, `src/components/ui/Button.tsx`.
- Hooks use camelCase with `use` prefix: `src/hooks/useClients.ts`, `src/hooks/useWorkflows.ts`.
- Services use kebab-case plus `.service.ts`: `src/lib/services/workflow-action.service.ts`.
- Repositories use kebab-case plus `.repository.ts`: `src/lib/database/repositories/workflow-step.repository.ts`.
- Tests sit near source and use `.test.ts`: `src/lib/services/workflow.service.test.ts`.
- Types use domain names and `.types.ts` or `.enum.ts`: `src/types/database.types.ts`, `src/types/error-codes.enum.ts`.

**Directories:**
- Feature component directories are lowercase plural nouns: `src/components/employees`, `src/components/documents`.
- Route groups use Next.js parentheses: `src/app/(auth)`, `src/app/(dashboard)`.
- Dynamic segments use brackets: `src/app/(dashboard)/clients/[id]`, `src/app/api/workflows/[id]`.
- Domain/data subdirectories use lowercase kebab-case where needed: `src/lib/client-data`, `src/lib/server-data`.

## Where to Add New Code

**New Dashboard Page:**
- Primary code: `src/app/(dashboard)/<route>/page.tsx`
- Shared layout: `src/app/(dashboard)/layout.tsx`
- Navigation: `src/components/layout/Sidebar.tsx`
- Feature components: `src/components/<feature>`
- Hooks: `src/hooks/use<Feature>.ts`

**New Public Auth Page:**
- Primary code: `src/app/(auth)/<route>/page.tsx`
- Auth components: `src/components/auth`
- API endpoint if needed: `src/app/api/auth/<action>/route.ts`

**New API Endpoint:**
- Route handler: `src/app/api/<resource>/route.ts` or `src/app/api/<resource>/[id]/route.ts`
- Validation: `src/lib/validation/schemas.ts`
- Business rules: `src/lib/services/<resource>.service.ts`
- Data access: `src/lib/database/repositories/<resource>.repository.ts` or `src/lib/server-data/<resource>-query.ts`
- Tests: Co-locate as `route.test.ts` for endpoint logic or add service/repository tests beside the service/repository.

**New Business Rule:**
- Primary code: `src/lib/services/<domain>.service.ts`
- Domain messages/constants: `src/lib/domain/messages.ts` or `src/lib/domain/workflow-templates.ts`
- Error codes: `src/types/error-codes.enum.ts`
- Tests: `src/lib/services/<domain>.service.test.ts`

**New Repository/Table Access:**
- Implementation: `src/lib/database/repositories/<table>.repository.ts`
- Shared types: `src/types/database.types.ts`
- Schema: `supabase/migrations/<number>_<description>.sql`
- Base schema mirror when appropriate: `supabase/schema.sql`
- Tests: `src/lib/database/repositories/<table>.repository.test.ts`

**New Supabase Table or Policy:**
- Migration: `supabase/migrations/<number>_<description>.sql`
- Schema mirror: `supabase/schema.sql`
- Type updates: `src/types/database.types.ts`
- Repository: `src/lib/database/repositories/<table>.repository.ts`
- RLS policies: include explicit `TO authenticated`.

**New Workflow Step or Intake Requirement:**
- Primary code: `src/lib/domain/workflow-templates.ts`
- UI copy/messages: `src/lib/domain/messages.ts`
- Schema/config migration if persisted: `supabase/migrations`
- Tests: `src/lib/services/workflow.service.test.ts` and document/step tests as needed.

**New UI Primitive:**
- Implementation: `src/components/ui/<Component>.tsx`
- Consumers: Feature components under `src/components/<feature>`
- Styling: Use Tailwind classes and CSS variables from `src/styles/globals.css`.

**Utilities:**
- Shared client fetch helpers: `src/lib/client-data`
- Shared server query helpers: `src/lib/server-data`
- Shared document helpers: `src/lib/services/document-helpers.ts`
- Shared calculations: `src/lib/services/financial-calculations.ts`

## Special Directories

**`.planning`:**
- Purpose: GSD planning and generated codebase mapping.
- Generated: Partially
- Committed: Yes

**`.codex`:**
- Purpose: Local Codex/GSD skills and workflow assets.
- Generated: Partially
- Committed: Project-specific local tooling may be present.

**`.agents`:**
- Purpose: Local agent skills outside the main GSD set.
- Generated: Partially
- Committed: Project-specific local tooling may be present.

**`.next`:**
- Purpose: Next.js build/dev output.
- Generated: Yes
- Committed: No

**`.open-next`:**
- Purpose: OpenNext Cloudflare build output.
- Generated: Yes
- Committed: No

**`.wrangler`:**
- Purpose: Wrangler/Cloudflare local state.
- Generated: Yes
- Committed: No

**`.vercel`:**
- Purpose: Vercel local project metadata.
- Generated: Yes
- Committed: No

**`node_modules`:**
- Purpose: Installed npm/pnpm dependencies.
- Generated: Yes
- Committed: No

**`public`:**
- Purpose: Static assets served directly by Next.js.
- Generated: No
- Committed: Yes

**`supabase/migrations`:**
- Purpose: Ordered database change history.
- Generated: No
- Committed: Yes

---

*Structure analysis: 2026-05-01*
