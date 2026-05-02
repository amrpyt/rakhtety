# Phase 7: Upgrade Next.js stack and regression test the app - Research

**Researched:** 2026-05-03
**Domain:** Next.js 16 / React 19 production readiness, Cloudflare OpenNext deployment, and Browser Use regression coverage
**Confidence:** HIGH for stack/version facts, MEDIUM for Cloudflare deployment risk until preview runs locally

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

### Production readiness target
- **D-01:** Treat the current Next.js app as the production target.
- **D-02:** "Production ready" means the app builds, typechecks, lints, passes automated tests, and passes browser checks for login, dashboard, clients, workflows, finance/reporting, and role gates.
- **D-03:** Keep Arabic RTL behavior as a hard requirement. The app stays right-to-left at the HTML/app-shell level.

### Upgrade approach
- **D-04:** Use the existing Next.js 16 / React 19 dependency direction already present in `package.json`.
- **D-05:** Prefer small compatibility fixes over large rewrites.
- **D-06:** Do not change business rules while upgrading. Workflow dependency rules, role rules, RLS expectations, and financial calculations must stay stable.

### Regression proof
- **D-07:** Run requested checks after each edit round before committing.
- **D-08:** Use Browser Use for browser E2E checks.
- **D-09:** Regression checks must cover admin and employee behavior because role mistakes are production blockers.

### Deployment readiness
- **D-10:** Verify the Cloudflare/OpenNext path as far as local tooling allows.
- **D-11:** If deployment tooling is blocked by provider/tool incompatibility, document the exact blocker and leave the app locally production-buildable.

### the agent's Discretion
- Exact task split, compatibility fix order, test additions, and small code cleanup are left to the agent.

### Deferred Ideas (OUT OF SCOPE)
- Full Frappe ERPNext rebuild belongs to Phase 8 and is not part of making this Next.js app production-ready.
</user_constraints>

## Summary

The app already targets the current Next.js 16 / React 19 line in `package.json`: `next@^16.2.4`, `react@^19.2.5`, `react-dom@^19.2.5`, `typescript@^6.0.3`, `vitest@^4.1.5`, `@opennextjs/cloudflare@^1.19.5`, and `wrangler@^4.86.0`. Registry checks confirm these are current or near-current packages on 2026-05-03: Next 16.2.4, React 19.2.5, TypeScript 6.0.3, Vitest 4.1.5, OpenNext Cloudflare 1.19.5, and Wrangler latest 4.87.0 while installed/package version is 4.86.0. [VERIFIED: npm registry] [VERIFIED: package.json]

The current local gates are partly healthy: `pnpm lint` exits 0 with 19 warnings, `pnpm test` passes 8 files / 35 tests, and `pnpm typecheck` passes after `next typegen`. `pnpm build` currently fails before compiling because Next reports another build process or stale `.next/lock`. This should be the first blocker in the plan: do not start compatibility edits until the build lock/process state is cleaned and a baseline build result is captured. [VERIFIED: local commands]

**Primary recommendation:** Slice Phase 7 into four small rounds: baseline/build-lock cleanup, Next 16/React 19 compatibility fixes, Cloudflare/OpenNext readiness, then Browser Use regression proof across admin and employee flows. [VERIFIED: CONTEXT.md] [VERIFIED: local commands]

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|--------------|----------------|-----------|
| Next.js build/type/lint compatibility | Frontend Server (SSR) | Browser / Client | App Router pages, route handlers, generated route types, and React components all compile through Next. [CITED: https://nextjs.org/docs/app/guides/upgrading/version-16] |
| React 19 compatibility | Browser / Client | Frontend Server (SSR) | Hooks/components run in the browser, while Server Components and rendering behavior still compile through Next. [CITED: https://react.dev/blog/2024/04/25/react-19-upgrade-guide] |
| Supabase auth/session regression | API / Backend | Browser / Client | Login/logout route handlers, Supabase server helpers, cookies/storage, and UI auth state must agree. [VERIFIED: AGENTS.md] [VERIFIED: file scan] |
| Workflow dependency rules | API / Backend | Database / Storage | `src/lib/services/workflow.service.ts` is the business-rule source; Supabase/RLS protects stored data. [VERIFIED: AGENTS.md] [VERIFIED: file scan] |
| Role gates | API / Backend | Browser / Client | Server permissions and UI visibility must both protect admin/employee behavior. [VERIFIED: AGENTS.md] [VERIFIED: file scan] |
| Cloudflare deployment | CDN / Static | Frontend Server (SSR) | OpenNext builds a Cloudflare Worker plus assets from the Next app. [CITED: https://opennext.js.org/cloudflare] |
| Browser Use regression coverage | Browser / Client | API / Backend | Real browser checks prove login, navigation, role gates, and form flows after the production gates pass. [VERIFIED: AGENTS.md] |

## Project Constraints (from AGENTS.md)

- Always speak English and keep explanations brief/simple. [VERIFIED: AGENTS.md]
- Use GSD workflows; do not freehand the project workflow. [VERIFIED: AGENTS.md]
- Commit every finished edit round only after requested checks are green. [VERIFIED: AGENTS.md]
- Use Browser Use for browser E2E checks. [VERIFIED: AGENTS.md]
- Keep Arabic RTL at `<html lang="ar" dir="rtl">`; do not scatter `dir="rtl"` on each component. [VERIFIED: AGENTS.md] [VERIFIED: src/app/layout.tsx]
- Do not change workflow order: Excavation Permit stays blocked until Device License is complete. [VERIFIED: AGENTS.md]
- RLS policies must include `TO authenticated`. [VERIFIED: AGENTS.md]
- Watch workflow indexes; missing indexes can cause severe slowdown. [VERIFIED: AGENTS.md]
- Preserve the app layering: UI -> hooks -> services -> repositories -> Supabase. [VERIFIED: AGENTS.md]
- Test accounts are available in AGENTS.md for admin and employee Browser Use checks. [VERIFIED: AGENTS.md]

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `next` | 16.2.4, modified 2026-05-02 | App Router framework, route handlers, build/type generation | Existing locked direction; official v16 guide covers async request APIs, typegen, proxy convention, and React 19.2. [VERIFIED: npm registry] [CITED: https://nextjs.org/docs/app/guides/upgrading/version-16] |
| `react` / `react-dom` | 19.2.5, modified 2026-04-30 | UI rendering and hooks | Existing dependency direction; React 19 is the correct paired major for this stack. [VERIFIED: npm registry] [CITED: https://react.dev/blog/2024/04/25/react-19-upgrade-guide] |
| `typescript` | 6.0.3, modified 2026-04-16 | Strict type checking | Existing package; `pnpm typecheck` already runs `next typegen && tsc --noEmit`. [VERIFIED: npm registry] [VERIFIED: local command] |
| `@supabase/ssr` | 0.10.2 | Server/client Supabase auth helpers | Existing app auth helpers live under `src/lib/supabase/`; preserve this. [VERIFIED: package.json] [VERIFIED: file scan] |
| `@supabase/supabase-js` | 2.105.1 | Supabase API client | Existing data/auth/storage client. [VERIFIED: package.json] |
| `zod` | 4.4.1 | Input validation | Existing validation dependency; use it for request/input contracts rather than hand checks. [VERIFIED: package.json] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `vitest` | 4.1.5, modified 2026-04-23 | Unit/API/service tests | Existing test runner; current suite passes 8 files / 35 tests. [VERIFIED: npm registry] [VERIFIED: local command] |
| `eslint` | 9.39.4 | Lint gate | Existing flat config with Next core-web-vitals and TypeScript rules. [VERIFIED: package.json] [VERIFIED: eslint.config.mjs] |
| `eslint-config-next` | 16.2.4 | Next lint rules | Existing config; currently reports warnings but no errors. [VERIFIED: package.json] [VERIFIED: local command] |
| `@opennextjs/cloudflare` | 1.19.5, modified 2026-04-30 | Cloudflare Worker build/preview/deploy adapter | Existing deployment path; official OpenNext says all minor/patch Next 16 versions are supported. [VERIFIED: npm registry] [CITED: https://opennext.js.org/cloudflare] |
| `wrangler` | package 4.86.0; latest 4.87.0, modified 2026-04-30 | Cloudflare local preview/deploy CLI | Existing scripts use Wrangler through OpenNext; consider minor bump only if preview fails or Cloudflare docs require it. [VERIFIED: npm registry] [VERIFIED: package.json] |
| `tailwindcss` | 3.4.13 | Styling | Existing UI styling stack; no Tailwind v4 migration in this phase. [VERIFIED: package.json] [VERIFIED: CONTEXT.md] |
| `lucide-react` | 1.14.0 | Icons | Existing icon library used by recent sidebar work; keep using it for UI fixes. [VERIFIED: package.json] [VERIFIED: STATE.md] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Current Next.js app | Frappe ERPNext rebuild | Explicitly deferred to Phase 8; do not spend Phase 7 budget here. [VERIFIED: CONTEXT.md] |
| Browser Use regression | Playwright scripts | User/project explicitly says Browser Use for browser E2E checks. [VERIFIED: AGENTS.md] |
| OpenNext Cloudflare Workers | Old `@cloudflare/next-on-pages` | OpenNext docs say it uses Next Node.js runtime; `next-on-pages` only supports Edge runtime and is less feature-complete. [CITED: https://opennext.js.org/cloudflare] |
| Broad React rewrite | Small compatibility fixes | Locked phase decision says prefer small compatibility fixes. [VERIFIED: CONTEXT.md] |

**Installation:**

```bash
pnpm install
```

**Version verification:**

```bash
npm view next version time.modified
npm view react version time.modified
npm view typescript version time.modified
npm view vitest version time.modified
npm view @opennextjs/cloudflare version time.modified
npm view wrangler version time.modified
```

## Current Baseline Findings

| Check | Command | Current Result | Planner Action |
|-------|---------|----------------|----------------|
| Lint | `pnpm lint` | PASS with 19 warnings | Convert production-relevant warnings to fixes or documented accepted warnings. [VERIFIED: local command] |
| Tests | `pnpm test` | PASS, 8 files / 35 tests | Keep as per-edit quick gate. [VERIFIED: local command] |
| Typecheck | `pnpm typecheck` | PASS; `next typegen` succeeds | Keep before build; generated types are required for route-aware helpers. [VERIFIED: local command] [CITED: https://nextjs.org/docs/app/api-reference/config/typescript] |
| Build | `pnpm build` | FAILS: another Next build process or stale `.next/lock` | First plan slice must resolve process/lock baseline without touching app behavior. [VERIFIED: local command] |
| Cloudflare preview | `pnpm preview` | Not run because normal build is blocked | Run only after `pnpm build` passes. [VERIFIED: package.json] |

### Current Lint Warning Clusters

- `<img>` warnings in `src/app/(dashboard)/clients/[id]/page.tsx`, `src/components/documents/DocumentUploadPanel.tsx`, and `src/components/ui/Avatar.tsx`. [VERIFIED: local command]
- Unused variables/imports in `KpiCard.tsx`, repository files, and related UI/data files. [VERIFIED: local command]
- React 19/React Compiler hook warnings in `src/hooks/useClients.ts`, `src/hooks/useDashboardAnalytics.ts`, `src/hooks/useDocuments.ts`, `src/hooks/useEmployees.ts`, `src/hooks/useFinancialDashboard.ts`, `src/hooks/useFinancials.ts`, and `src/hooks/useWorkflows.ts`. [VERIFIED: local command]

## Architecture Patterns

### System Architecture Diagram

```text
Browser Use / User
  -> Next App Router pages in src/app/(dashboard)
  -> React components in src/components
  -> hooks in src/hooks
  -> services in src/lib/services
  -> repositories in src/lib/database/repositories
  -> Supabase Auth / Database / Storage

Production gates
  -> pnpm lint
  -> pnpm test
  -> pnpm typecheck (next typegen + tsc)
  -> pnpm build
  -> pnpm preview (OpenNext Cloudflare)
  -> Browser Use admin/employee regression
```

### Recommended Project Structure

```text
src/
├── app/                         # Next routes, layouts, API route handlers
├── components/                  # Reusable UI pieces
├── hooks/                       # UI-to-service bridge
├── lib/auth/                    # Role and permission helpers
├── lib/database/repositories/   # Supabase read/write layer
├── lib/services/                # Business rules and workflow/finance logic
├── lib/supabase/                # Supabase server/client/proxy helpers
└── types/                       # Shared contracts
```

### Pattern 1: Keep Compatibility Fixes Near the Failing Gate

**What:** If lint fails, fix the linted file only; if typecheck fails, fix types/contracts only; if build fails, fix build/runtime imports only. [VERIFIED: CONTEXT.md]

**When to use:** Every Phase 7 edit round.

**Example:**

```bash
pnpm lint
pnpm test
pnpm typecheck
pnpm build
```

### Pattern 2: Treat `next typegen` as Part of Typecheck

**What:** Next generates global route helpers during `next dev`, `next build`, or `next typegen`; this app already uses `next typegen && tsc --noEmit`. [CITED: https://nextjs.org/docs/app/api-reference/config/typescript] [VERIFIED: package.json]

**When to use:** Before judging route/page type failures.

**Example:**

```bash
pnpm typecheck
```

### Pattern 3: Cloudflare Build After Local Next Build

**What:** Run `pnpm build` first, then `pnpm preview`. OpenNext wraps the Next build into a Worker/assets output, so debugging is simpler when the normal Next build is already green. [VERIFIED: package.json] [CITED: https://opennext.js.org/cloudflare]

**When to use:** Deployment readiness slice.

**Example:**

```bash
pnpm build
pnpm preview
```

### Anti-Patterns to Avoid

- **Skipping the stale build lock:** The current `pnpm build` failure is environmental/process state, not proof the app compiles. Clear or isolate that first. [VERIFIED: local command]
- **Fixing React warnings by suppressing rules globally:** The hook warnings point at real React 19/Compiler compatibility risk. Fix locally or document why each warning is accepted. [VERIFIED: local command]
- **Testing only admin:** Employee visibility and role gates are production blockers. [VERIFIED: CONTEXT.md] [VERIFIED: AGENTS.md]
- **Changing workflow behavior during upgrade:** Device License -> Excavation dependency must stay stable. [VERIFIED: CONTEXT.md] [VERIFIED: AGENTS.md]
- **Migrating Tailwind or UI system:** Tailwind v4 or visual redesign is out of scope; Phase 7 is compatibility and regression proof. [VERIFIED: package.json] [VERIFIED: CONTEXT.md]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Route/page prop typing | Custom route type definitions | `next typegen`, `PageProps`, `LayoutProps`, `RouteContext` | Next provides generated helpers for App Router route types. [CITED: https://nextjs.org/docs/app/api-reference/config/typescript] |
| Next 16 migration mechanics | Manual global rename scripts | Official Next codemods when needed | Next has a `middleware-to-proxy` codemod and upgrade codemods. [CITED: https://nextjs.org/docs/app/guides/upgrading/version-16] |
| Runtime data validation | Ad hoc `if` trees | `zod` | Existing dependency and safer typed validation. [VERIFIED: package.json] |
| Browser regression | Custom Playwright workaround | Browser Use | Project instruction requires Browser Use for browser E2E. [VERIFIED: AGENTS.md] |
| Cloudflare Worker packaging | Custom Worker wrapper | `@opennextjs/cloudflare` | Adapter supports Next 16 and emits Worker/assets output. [CITED: https://opennext.js.org/cloudflare] |
| Auth/session storage | Custom cookie/session parser | Existing Supabase SSR helpers | Existing helpers live in `src/lib/supabase/`; recent notes say auth handoff is subtle. [VERIFIED: AGENTS.md] [VERIFIED: file scan] |

**Key insight:** The app already has the right high-level stack. The risk is not choosing libraries; the risk is proving each existing layer still works under Next 16/React 19 and Cloudflare packaging. [VERIFIED: package.json] [VERIFIED: local commands]

## Common Pitfalls

### Pitfall 1: Stale `.next/lock` Masks Real Build Status

**What goes wrong:** `pnpm build` fails before compiling with "Another next build process is already running." [VERIFIED: local command]
**Why it happens:** A live or crashed Next build/dev process leaves `.next/lock` behind. [VERIFIED: local filesystem]
**How to avoid:** Stop only confirmed repo-related Next/Node processes or clean generated `.next` state in a controlled edit round, then rerun `pnpm build`. [VERIFIED: local command]
**Warning signs:** `.next/lock` exists and build exits in seconds. [VERIFIED: local filesystem]

### Pitfall 2: Async Request API Breakage

**What goes wrong:** Pages/layouts/route contexts that synchronously read `params`, `searchParams`, `cookies`, `headers`, or `draftMode` can break in Next 16. [CITED: https://nextjs.org/docs/app/guides/upgrading/version-16]
**Why it happens:** Next 16 fully removed the temporary synchronous compatibility from Next 15. [CITED: https://nextjs.org/docs/app/guides/upgrading/version-16]
**How to avoid:** Use async request APIs and generated route-aware types. [CITED: https://nextjs.org/docs/app/api-reference/config/typescript]
**Warning signs:** Type errors after `next typegen`, build errors in dynamic pages, or route handler context errors.

### Pitfall 3: React 19 Hook Warnings Treated as Noise

**What goes wrong:** Current lint warnings include synchronous `setState` in effects and memoization preservation warnings. [VERIFIED: local command]
**Why it happens:** React 19-era linting/compiler rules are stricter about patterns that can cause extra renders or missed optimization. [CITED: https://react.dev/blog/2024/04/25/react-19-upgrade-guide]
**How to avoid:** Fix the smallest hook patterns first, especially shared hooks used by dashboard, clients, documents, finance, and workflows. [VERIFIED: local command]
**Warning signs:** Warnings in `src/hooks/*` after `pnpm lint`.

### Pitfall 4: Cloudflare Support Assumed Before Preview

**What goes wrong:** Normal Next build may pass, but OpenNext preview/deploy can still fail due Worker runtime, R2 cache config, assets, env vars, or Windows path issues. [CITED: https://opennext.js.org/cloudflare] [VERIFIED: wrangler.jsonc]
**Why it happens:** OpenNext packages Next into Cloudflare Worker output, which is a different runtime surface than local Next. [CITED: https://opennext.js.org/cloudflare]
**How to avoid:** Make `pnpm preview` its own plan slice after `pnpm build` passes; document exact provider/tool blocker if it fails. [VERIFIED: CONTEXT.md]
**Warning signs:** `.open-next` output errors, Wrangler preview errors, missing R2 bucket/binding, or missing Cloudflare env secrets.

### Pitfall 5: Browser Auth Handoff Looks Like Login Failure

**What goes wrong:** Magic-link/session handoff can redirect back to `/login` even when Supabase returned a session. [VERIFIED: AGENTS.md]
**Why it happens:** Browser storage/cookie state and app session parsing can disagree; redirect URL/port matters. [VERIFIED: AGENTS.md]
**How to avoid:** In Browser Use, check storage/cookies and app session state before blaming credentials. Use `localhost:3000` for auth handoff when possible. [VERIFIED: AGENTS.md]
**Warning signs:** Dashboard bounces to login after apparently successful auth.

## Relevant Files

| Area | Files |
|------|-------|
| Package/scripts | `package.json`, `pnpm-lock.yaml` |
| Next config | `next.config.mjs`, `next-env.d.ts`, `tsconfig.json` |
| Lint/test config | `eslint.config.mjs`, `vitest.config.ts` |
| Cloudflare/OpenNext | `open-next.config.ts`, `wrangler.jsonc`, `.open-next/` output |
| App routes | `src/app/(auth)`, `src/app/(dashboard)`, `src/app/api` |
| RTL root | `src/app/layout.tsx` |
| Auth/session | `src/lib/supabase/*`, `src/lib/auth/*`, `src/hooks/auth/useAuth.ts`, `src/app/api/auth/*` |
| Workflow rules | `src/lib/services/workflow.service.ts`, `src/lib/services/workflow-action.service.ts`, `src/hooks/useWorkflows.ts` |
| Finance/reporting | `src/lib/services/financial*.ts`, `src/lib/services/ledger-summary.service.ts`, `src/app/(dashboard)/finance`, `src/app/(dashboard)/clients/[id]/report`, `src/app/api/clients/[id]/report/route.ts` |
| Existing tests | `src/**/*.test.ts` currently 8 files |

## Recommended Plan Slices

1. **Baseline and build-lock cleanup**
   - Confirm no user-owned dev server is needed.
   - Resolve `.next/lock` / running Next build state.
   - Rerun `pnpm lint`, `pnpm test`, `pnpm typecheck`, `pnpm build`.
   - Commit only if all requested checks are green. [VERIFIED: AGENTS.md]

2. **Next 16 / React 19 compatibility fixes**
   - Fix build/type errors first.
   - Then reduce production-relevant lint warnings in shared hooks/components.
   - Preserve business behavior; add/update Vitest tests only where behavior is at risk. [VERIFIED: CONTEXT.md]

3. **Cloudflare/OpenNext readiness**
   - Run `pnpm preview` after local build passes.
   - Verify `wrangler.jsonc` env vars, R2 cache bucket expectation, self-reference binding, assets binding, and image binding.
   - If blocked, write exact blocker and leave app locally buildable. [VERIFIED: CONTEXT.md] [VERIFIED: wrangler.jsonc]

4. **Browser Use regression proof**
   - Start app on a stable port, preferably `localhost:3000` for auth handoff. [VERIFIED: AGENTS.md]
   - Admin: login, dashboard, clients, client detail, workflows queue, finance/reporting, employee management/role visibility.
   - Employee: login, assigned workflow visibility, blocked admin-only actions, assigned work access.
   - Workflow dependency: verify Excavation Permit cannot start before Device License complete.
   - RTL: verify `<html dir="rtl">` and Arabic layout is still right-to-left.

## Code Examples

### Next Type Generation Gate

```bash
# Source: Next.js TypeScript docs and package.json
pnpm typecheck
```

### Next 16 Route-Aware Page Props Pattern

```tsx
// Source: https://nextjs.org/docs/app/guides/upgrading/version-16
export default async function Page(props: PageProps<'/clients/[id]'>) {
  const { id } = await props.params
  return <main>{id}</main>
}
```

### OpenNext Cloudflare Preview Gate

```bash
# Source: package.json and OpenNext Cloudflare docs
pnpm preview
```

### Vitest DOM Environment If Component Tests Are Added

```ts
// Source: Vitest v4 docs
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
  },
})
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Synchronous `cookies`, `headers`, `params`, `searchParams` compatibility | Async request APIs only | Next 16 | Build/type failures can appear in route handlers and dynamic pages. [CITED: https://nextjs.org/docs/app/guides/upgrading/version-16] |
| `middleware.ts` convention | `proxy.ts` convention | Next 16 | This repo has no root `middleware.*` or `proxy.*` found, so no immediate rename was found. [CITED: https://nextjs.org/docs/app/guides/upgrading/version-16] [VERIFIED: file scan] |
| `next-on-pages` Edge-only deployment | `@opennextjs/cloudflare` Node.js runtime deployment | Current OpenNext docs | Use OpenNext path already in package scripts. [CITED: https://opennext.js.org/cloudflare] |
| Vitest coverage `coverage.all` / `coverage.extensions` | Explicit `coverage.include` if coverage is added | Vitest v4 | Current config has no coverage block, so no migration needed now. [CITED: https://main.vitest.dev/guide/migration] [VERIFIED: vitest.config.ts] |

**Deprecated/outdated:**
- `middleware.ts`: deprecated in favor of `proxy.ts` in Next 16; no root middleware file was found in this repo. [CITED: https://nextjs.org/docs/app/guides/upgrading/version-16] [VERIFIED: file scan]
- `@cloudflare/next-on-pages`: do not use for this phase; OpenNext docs distinguish it as Edge-only compared with OpenNext Cloudflare using Node.js runtime. [CITED: https://opennext.js.org/cloudflare]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Browser Use is callable by the implementing agent in the same way prior project notes describe. [ASSUMED] | Environment Availability | If unavailable, the planner must install/use the configured `agent-browser` fallback before regression can complete. |
| A2 | Cloudflare account credentials/bucket creation rights are available to the human or environment when deploy/preview reaches provider resources. [ASSUMED] | Environment Availability | `pnpm preview` may work but deploy or R2 setup may block on credentials. |

## Open Questions

1. **Should lint warnings be treated as blockers before production?**
   - What we know: `pnpm lint` exits 0 but reports 19 warnings. [VERIFIED: local command]
   - What's unclear: Whether the team wants zero warnings as a release gate.
   - Recommendation: Fix React hook warnings and unused code in Phase 7; accept `<img>` only if preview/download behavior makes `next/image` unsuitable.

2. **Is Cloudflare deployment required to complete, or is local deploy-readiness enough?**
   - What we know: Context says verify as far as local tooling allows and document provider/tool blockers. [VERIFIED: CONTEXT.md]
   - What's unclear: Whether credentials/R2 bucket are already configured.
   - Recommendation: Make local `pnpm preview` required; make real `pnpm deploy` conditional on credentials.

3. **Who owns the many pre-existing uncommitted app changes?**
   - What we know: `git status --short` shows many modified/untracked app files before this research artifact was written. [VERIFIED: local command]
   - What's unclear: Whether these are user changes, prior agent changes, or intended Phase 7 baseline.
   - Recommendation: Planner should begin with a baseline/status task and avoid reverting any unrelated changes.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | Next/Vitest/OpenNext | Yes | v24.5.0 | If runtime incompatibility appears, try the Node version supported by Next/OpenNext docs. [VERIFIED: local command] |
| pnpm | Package scripts | Yes | 10.32.1 | npm is available at 11.5.1 but packageManager is pnpm. [VERIFIED: local command] |
| npm | Version checks / npx | Yes | 11.5.1 | pnpm for project scripts. [VERIFIED: local command] |
| Next CLI | Build/typegen | Yes | 16.2.4 | Use `pnpm exec next`. [VERIFIED: local command] |
| Vitest CLI | Unit tests | Yes | 4.1.5 | None needed. [VERIFIED: local command] |
| Wrangler CLI | Cloudflare preview/deploy | Yes | 4.86.0 installed/package; 4.87.0 latest | Bump patch if OpenNext preview requires it. [VERIFIED: local command] [VERIFIED: npm registry] |
| Browser Use / agent-browser | E2E regression | Assumed available | noted in AGENTS.md | If missing, load/use Browser Use plugin/agent-browser before execution. [ASSUMED] [VERIFIED: AGENTS.md] |
| Supabase project/env | Auth/data/browser regression | Partially configured by env/repo notes | unknown | Use existing test accounts; document missing env vars if login/API fails. [VERIFIED: AGENTS.md] |
| Cloudflare account/R2 bucket | Deploy readiness | Unknown | unknown | Local `pnpm preview`; document deploy blocker if credentials/bucket missing. [ASSUMED] |

**Missing dependencies with no fallback:**
- None proven during research.

**Missing dependencies with fallback:**
- Cloudflare deploy credentials/R2 bucket are unknown; fallback is local `pnpm preview` plus exact blocker documentation. [ASSUMED] [VERIFIED: CONTEXT.md]

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.5 [VERIFIED: npm registry] |
| Config file | `vitest.config.ts` [VERIFIED: file scan] |
| Quick run command | `pnpm test` |
| Full suite command | `pnpm lint && pnpm test && pnpm typecheck && pnpm build` |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|--------------|
| P7-01 | Build/type/lint/test gates pass | static/unit/build | `pnpm lint; pnpm test; pnpm typecheck; pnpm build` | Partial; build currently blocked by `.next/lock` |
| P7-02 | Auth works for admin and employee | Browser Use E2E | Browser Use login on `localhost:3000` | No dedicated script; manual Browser Use required |
| P7-03 | Dashboard, clients, workflows, finance/reporting routes work | Browser Use E2E | Browser Use route smoke suite | No dedicated script; manual Browser Use required |
| P7-04 | Role gates preserved | unit + Browser Use | `pnpm test src/lib/auth/permissions.test.ts`; Browser Use admin/employee checks | Unit exists; Browser Use proof missing |
| P7-05 | Workflow dependency preserved | unit + Browser Use | `pnpm test src/lib/services/workflow.service.test.ts`; Browser Use blocked Excavation check | Unit exists; Browser Use proof missing |
| P7-06 | Cloudflare/OpenNext readiness verified | build/deploy smoke | `pnpm preview` | Config exists; preview not yet proven |

### Sampling Rate

- **Per task commit:** `pnpm lint && pnpm test && pnpm typecheck`
- **Per wave merge:** `pnpm lint && pnpm test && pnpm typecheck && pnpm build`
- **Phase gate:** Full suite green, `pnpm preview` attempted/documented, and Browser Use admin/employee regression completed.

### Wave 0 Gaps

- [ ] Resolve `.next/lock` / concurrent build process before any source compatibility edits. [VERIFIED: local command]
- [ ] Capture clean `pnpm build` baseline. [VERIFIED: local command]
- [ ] Define Browser Use checklist artifact in the plan/verification output; no existing browser regression script was found. [VERIFIED: file scan]
- [ ] Decide whether lint warnings must go to zero for production. [VERIFIED: local command]

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|------------------|
| V2 Authentication | yes | Supabase Auth and existing SSR helpers; test login/logout/session handoff. [VERIFIED: package.json] [VERIFIED: file scan] |
| V3 Session Management | yes | Supabase SSR cookies/storage; Browser Use must verify redirect/session persistence. [VERIFIED: AGENTS.md] |
| V4 Access Control | yes | `src/lib/auth/permissions.ts`, server permissions, RLS with `TO authenticated`. [VERIFIED: AGENTS.md] [VERIFIED: file scan] |
| V5 Input Validation | yes | Use `zod`; do not hand-roll request validation. [VERIFIED: package.json] |
| V6 Cryptography | no direct custom crypto | Do not add custom crypto; rely on Supabase/TLS/provider primitives. [ASSUMED] |

### Known Threat Patterns for Next.js/Supabase

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Broken role gate after UI upgrade | Elevation of privilege | Server-side permission checks plus Browser Use admin/employee regression. [VERIFIED: CONTEXT.md] |
| Session cookie mismatch after auth changes | Spoofing | Verify Supabase SSR helpers and browser storage/cookies. [VERIFIED: AGENTS.md] |
| RLS policy drift | Information disclosure | Ensure policies include `TO authenticated`; do not weaken migrations. [VERIFIED: AGENTS.md] |
| Unvalidated route/API input | Tampering | Use existing `zod` validation where route handlers accept input. [VERIFIED: package.json] |
| Cloudflare env secret exposure | Information disclosure | Keep service role key as Wrangler secret, not public var. [VERIFIED: wrangler.jsonc] |

## Sources

### Primary (HIGH confidence)

- Context7 `/vercel/next.js/v16.2.2` - Next 16 upgrade, async request APIs, typegen, middleware/proxy.
- Context7 `/reactjs/react.dev` - React 19 upgrade compatibility.
- Context7 `/vitest-dev/vitest/v4.0.7` - Vitest v4 migration/config behavior.
- `https://nextjs.org/docs/app/guides/upgrading/version-16` - official Next 16 upgrade guide.
- `https://nextjs.org/docs/app/api-reference/config/typescript` - official Next TypeScript/typegen docs.
- `https://opennext.js.org/cloudflare` - OpenNext Cloudflare support/runtime docs.
- `https://main.vitest.dev/guide/migration` - Vitest v4 migration docs.
- Local files: `package.json`, `AGENTS.md`, `.planning/STATE.md`, `.planning/ROADMAP.md`, `.planning/REQUIREMENTS.md`, `07-CONTEXT.md`, config files.
- Local commands: `npm view ...`, `pnpm lint`, `pnpm test`, `pnpm typecheck`, `pnpm build`.

### Secondary (MEDIUM confidence)

- `https://developers.cloudflare.com/pages/framework-guides/nextjs/` - Cloudflare framework docs cross-check.

### Tertiary (LOW confidence)

- None used as authoritative input.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - package versions verified against npm registry and local `package.json`.
- Architecture: HIGH - project layering verified in AGENTS.md and local file layout.
- Pitfalls: HIGH for current local blockers and Next/Vitest documented changes; MEDIUM for Cloudflare deployment until `pnpm preview` runs cleanly.

**Research date:** 2026-05-03
**Valid until:** 2026-05-10 for fast-moving Next/OpenNext/Wrangler versions.
