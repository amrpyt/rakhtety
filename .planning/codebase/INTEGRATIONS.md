# External Integrations

**Analysis Date:** 2026-05-01

## APIs & External Services

**Supabase Platform:**
- Supabase Postgres - Primary relational database for profiles, clients, workflows, workflow steps, employees, financial events, documents, dashboard alerts, and action logs.
  - SDK/Client: `@supabase/supabase-js` and `@supabase/ssr`.
  - Auth: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and server-only `SUPABASE_SERVICE_ROLE_KEY`.
  - Client files: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/admin.ts`, and `src/lib/supabase/proxy.ts`.
- Supabase Auth - Email/password login, logout, session refresh, route protection, and admin user creation.
  - SDK/Client: `@supabase/ssr` for user sessions and `@supabase/supabase-js` admin API for signup.
  - Auth endpoints: `src/app/api/auth/login/route.ts`, `src/app/api/auth/logout/route.ts`, and `src/app/api/auth/signup/route.ts`.
  - Middleware: `src/middleware.ts` calls `src/lib/supabase/proxy.ts` to refresh sessions and protect routes.
- Supabase Storage - Private document file storage in bucket `workflow-documents`.
  - SDK/Client: `@supabase/supabase-js` admin storage client in `src/lib/supabase/admin.ts`.
  - Upload handlers: `src/app/api/workflow-documents/upload/route.ts` and `src/app/api/clients/[id]/intake-documents/upload/route.ts`.
  - Signed URL handler: `src/app/api/clients/[id]/intake-documents/[documentId]/signed-url/route.ts`.
  - Bucket/policies: `supabase/migrations/006_create_workflow_documents.sql`.

**Cloudflare Platform:**
- Cloudflare Workers - Production runtime for the Next.js app after OpenNext build.
  - SDK/Client: `@opennextjs/cloudflare` build adapter and `wrangler` CLI.
  - Config: `wrangler.jsonc` and `open-next.config.ts`.
- Cloudflare R2 - Incremental cache storage for OpenNext.
  - SDK/Client: `@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache`.
  - Binding: `NEXT_INC_CACHE_R2_BUCKET`.
  - Bucket: `rakhtety-opennext-cache`.
  - Config: `open-next.config.ts` and `wrangler.jsonc`.
- Cloudflare Images - Image optimization binding for OpenNext.
  - Binding: `IMAGES`.
  - Config: `wrangler.jsonc`.
- Cloudflare Assets - Static asset serving for OpenNext.
  - Binding: `ASSETS`.
  - Directory: `.open-next/assets`.
  - Config: `wrangler.jsonc`.

**Internal HTTP APIs:**
- Next.js API routes expose app-owned JSON/form endpoints under `src/app/api/**`.
  - Auth: `src/app/api/auth/login/route.ts`, `src/app/api/auth/logout/route.ts`, `src/app/api/auth/signup/route.ts`.
  - Clients: `src/app/api/clients/route.ts` and `src/app/api/clients/[id]/route.ts`.
  - Client workflows: `src/app/api/clients/[id]/workflows/route.ts`.
  - Reports: `src/app/api/clients/[id]/report/route.ts`.
  - Dashboard: `src/app/api/dashboard/summary/route.ts`.
  - Employees: `src/app/api/employees/route.ts`.
  - Documents: `src/app/api/workflow-documents/upload/route.ts`, `src/app/api/clients/[id]/intake-documents/upload/route.ts`, and `src/app/api/clients/[id]/intake-documents/[documentId]/signed-url/route.ts`.
  - Finance: `src/app/api/workflows/[id]/financial-summary/route.ts`.

## Data Storage

**Databases:**
- Supabase Postgres.
  - Connection: Supabase project URL/key environment variables in `src/config/database.config.ts`.
  - Client: Supabase query clients returned by `src/lib/supabase/server.ts` and `src/lib/supabase/admin.ts`.
  - Schema: `supabase/schema.sql`.
  - Migrations: `supabase/migrations/*.sql`.
  - Typed entities: `src/types/database.types.ts`.
  - Repository layer: `src/lib/database/repositories/*.repository.ts`.
- Supabase Auth schema.
  - Connection: same Supabase project.
  - Client: `supabase.auth` in `src/app/api/auth/login/route.ts`, `src/app/api/auth/logout/route.ts`, `src/hooks/auth/useSession.ts`, and `src/lib/supabase/proxy.ts`.
  - Admin user creation: `adminClient.auth.admin.createUser` in `src/app/api/auth/signup/route.ts`.

**File Storage:**
- Supabase Storage bucket `workflow-documents`.
  - Workflow document metadata table: `workflow_documents`, created in `supabase/migrations/006_create_workflow_documents.sql`.
  - Client intake document metadata table: `client_intake_documents`, created in `supabase/migrations/014_create_client_intake_documents.sql`.
  - Storage upload paths are created by `src/lib/services/document-helpers.ts`.
  - Files are uploaded by admin storage clients in `src/app/api/workflow-documents/upload/route.ts` and `src/app/api/clients/[id]/intake-documents/upload/route.ts`.
  - Browser access should use short-lived signed URLs from `src/app/api/clients/[id]/intake-documents/[documentId]/signed-url/route.ts`.

**Caching:**
- Cloudflare R2 incremental cache for OpenNext.
  - Config: `open-next.config.ts`.
  - Binding: `NEXT_INC_CACHE_R2_BUCKET` in `wrangler.jsonc`.
- No Redis, Memcached, or app-level cache detected.

## Authentication & Identity

**Auth Provider:**
- Supabase Auth.
  - Implementation: Email/password login via `supabase.auth.signInWithPassword` in `src/app/api/auth/login/route.ts`.
  - Logout: `supabase.auth.signOut` in `src/app/api/auth/logout/route.ts`.
  - Signup: server-side admin user creation in `src/app/api/auth/signup/route.ts`, followed by profile upsert into `profiles`.
  - Session source: Supabase cookies managed by `@supabase/ssr` in `src/lib/supabase/server.ts`, `src/lib/supabase/client.ts`, and `src/lib/supabase/proxy.ts`.
  - Route protection: `src/middleware.ts` protects `/dashboard`, `/clients`, `/workflows`, `/employees`, and `/settings`.
  - Client auth state: `src/hooks/auth/useSession.ts` subscribes to `supabase.auth.onAuthStateChange`.
  - App provider: `src/providers/AuthProvider.tsx`.
  - Role metadata: roles `admin`, `manager`, and `employee` are configured in `src/config/auth.config.ts` and enforced by SQL policies in `supabase/schema.sql` and migrations.

## Monitoring & Observability

**Error Tracking:**
- None detected. No Sentry, LogRocket, Datadog, New Relic, or similar package is present in `package.json`.

**Logs:**
- Application error responses are returned from Next.js route handlers such as `src/app/api/auth/login/route.ts`, `src/app/api/clients/route.ts`, and `src/app/api/workflow-documents/upload/route.ts`.
- Build/dev logs exist as local files `dev-server.out.log`, `dev-server.err.log`, `next-dev.out.log`, `next-dev.err.log`, `next-start.out.log`, `next-start.err.log`, and `opennext-build.log`.
- No structured logging service or central logger module detected in `src/**`.

## CI/CD & Deployment

**Hosting:**
- Cloudflare Workers through OpenNext.
  - Worker name: `rakhtety` in `wrangler.jsonc`.
  - Worker entry: `.open-next/worker.js` in `wrangler.jsonc`.
  - Build/deploy commands: `pnpm preview`, `pnpm deploy`, and `pnpm upload` in `package.json`.
- Vercel metadata directory `.vercel/` exists locally, but production configuration points to Cloudflare through `wrangler.jsonc` and `open-next.config.ts`.

**CI Pipeline:**
- None detected in repository files scanned. No `.github/workflows/**` pipeline was detected.

## Environment Configuration

**Required env vars:**
- `NEXT_PUBLIC_SUPABASE_URL` - Required by `src/config/database.config.ts` for browser, server, and middleware clients.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` - Preferred public Supabase key in `src/config/database.config.ts`.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supported fallback public Supabase key in `src/config/database.config.ts` and declared in `wrangler.jsonc`.
- `SUPABASE_SERVICE_ROLE_KEY` - Required by `src/config/database.config.ts` for admin operations in `src/lib/supabase/admin.ts`.

**Secrets location:**
- `.env.local` exists and contains local environment configuration; do not read or commit its values.
- `.dev.vars` exists and contains local Cloudflare/development environment configuration; do not read or commit its values.
- Cloudflare dashboard variables are represented by placeholders in `wrangler.jsonc`.
- Cloudflare secret `SUPABASE_SERVICE_ROLE_KEY` should be set with `wrangler secret put SUPABASE_SERVICE_ROLE_KEY`, as documented in `wrangler.jsonc`.

## Webhooks & Callbacks

**Incoming:**
- No external webhook endpoints detected.
- App-owned internal API route handlers live under `src/app/api/**`.

**Outgoing:**
- No outgoing third-party webhook integrations detected.
- Browser-to-app requests use relative `fetch()` calls to internal routes, for example `src/hooks/auth/useAuth.ts`, `src/hooks/useDashboardAnalytics.ts`, `src/app/(dashboard)/clients/[id]/page.tsx`, and `src/app/(dashboard)/clients/[id]/report/page.tsx`.
- Server-side external network access is limited to Supabase client calls and Cloudflare platform runtime bindings detected in this scan.

---

*Integration audit: 2026-05-01*
