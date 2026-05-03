# Phase 1: Core Foundation - Research

**Researched:** 2026-04-28
**Phase:** 01 - Core Foundation
**Objective:** Answer "What do I need to know to PLAN this phase well?"

---

## Domain Analysis

### Supabase Auth Patterns

**Session Management:**
- Supabase Auth supports persistent sessions via localStorage
- Session persists until explicit logout (D-01: no automatic expiry)
- Client: `supabase.auth.getSession()` on app load
- Server: Middleware validates JWT on each request

**Role-Based Access Control (RBAC):**
- Three roles: Admin (مدير), Employee (موظف), Manager (مدير)
- Supabase RLS policies enforce row-level security
- AUTH-03: Employees see only assigned workflows
- AUTH-04: Admins see all workflows and manage employees

**Auth UI Pattern (from demo):**
- Login form with email + password fields
- Dark themed login page with blur backdrop
- Logo + office name branding

**No email verification or password reset in Phase 1 (D-02)**

### Database Schema Approach

**Tables Required:**

1. **`profiles`** — Extends auth.users
   - `id` (uuid, FK auth.users)
   - `role` (enum: admin, employee, manager)
   - `full_name` (text)
   - `phone` (text, nullable)
   - `created_at`, `updated_at`

2. **`clients`** — CRM core
   - `id` (uuid, PK)
   - `name` (text, required)
   - `phone` (text)
   - `city` (text)
   - `district` (text)
   - `neighborhood` (text)
   - `parcel_number` (text)
   - `created_by` (uuid, FK profiles)
   - `created_at`, `updated_at`

3. **`workflows`** — Main workflow container
   - `id` (uuid, PK)
   - `client_id` (uuid, FK clients)
   - `type` (enum: DEVICE_LICENSE, EXCAVATION_PERMIT)
   - `status` (enum: pending, in_progress, completed, blocked)
   - `assigned_to` (uuid, FK profiles, nullable)
   - `created_at`, `updated_at`

4. **`workflow_steps`** — Individual steps (D-06: separate table)
   - `id` (uuid, PK)
   - `workflow_id` (uuid, FK workflows)
   - `step_order` (integer)
   - `name` (text)
   - `status` (enum: pending, in_progress, completed, blocked)
   - `assigned_to` (uuid, FK profiles, nullable)
   - `completed_at` (timestamp, nullable)
   - `fees` (numeric) — government fees
   - `profit` (numeric) — office profit
   - `created_at`, `updated_at`

5. **`employees`** — Employee management
   - `id` (uuid, PK)
   - `user_id` (uuid, FK profiles)
   - `role` (text)
   - `position` (text)
   - `is_active` (boolean)
   - `created_at`, `updated_at`

### Row-Level Security (RLS) Policies

**profiles table:**
- Users can read all profiles (for employee listing)
- Only admins can update profiles

**clients table:**
- Authenticated users can read clients
- Employees see only clients they have workflows for
- Admins see all clients

**workflows table:**
- Employees: SELECT where `assigned_to = auth.uid()`
- Admins: SELECT all

**workflow_steps table:**
- Inherited from parent workflow access

### Next.js Project Structure

```
rakhtety/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx (dashboard)
│   │   ├── clients/
│   │   ├── workflows/
│   │   ├── employees/
│   │   └── settings/
│   ├── api/
│   │   └── [...]
│   └── layout.tsx
├── components/
│   ├── ui/ (base components)
│   ├── forms/
│   └── layout/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   └── utils/
├── styles/
│   └── globals.css
└── types/
    └── database.types.ts
```

### Component Extraction Strategy (from demo.html)

**CSS Design Tokens (CSS Custom Properties):**
- Extract from `:root` block (lines 15-60)
- Map to Tailwind config or CSS modules
- Key tokens: colors, spacing, typography, shadows, radii

**Components to Extract:**

1. **Layout Components:**
   - `.app-shell` → AppLayout
   - `.sidebar` → Sidebar
   - `.main-content` → MainContent
   - `.top-bar` → TopBar

2. **UI Components:**
   - `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-danger` → Button variants
   - `.card` → Card
   - `.badge` → Badge variants
   - `.kpi-card` → KpiCard
   - `.table-wrap` → Table wrapper
   - `.form-group`, `.form-label`, `.form-input` → Form primitives
   - `.tabs`, `.tab` → Tab components
   - `.alert`, `.alert-warning`, `.alert-error` → Alert variants
   - `.progress-bar`, `.progress-fill` → ProgressBar
   - `.workflow-track`, `.workflow-step` → WorkflowStep components
   - `.search-bar` → SearchBar

3. **Icons:**
   - Using `lucide-react` (already in demo: `lucide@latest`)
   - Map SVG paths from demo to lucide icon imports

### Workflow UI (Phase 1 Scope: UI Only)

**Device License Workflow (5 steps):**
1. بيان الصلاحية (Eligibility Statement)
2. تقديم المجمعة العشرية للإسكان المميز (Submit Decade Collective)
3. تقديم الملف (File Submission)
4. دفع إذن الرخصة وشراء عقد مخلفات (Pay License Fee)
5. استلام الرخصة (Receive License)

**Excavation Permit Workflow (5 steps):**
1. تقديم واستلام شهادة الإشراف (Supervision Certificate)
2. تقديم واستلام التأمينات (Insurance)
3. التقديم على العداد الإنشائي (Construction Meter)
4. تقديم ودفع واستلام تصريح الحفر (Excavation Permit)
5. تصريح التعدين (Mining Permit)

**Dependency:** Excavation Permit blocked until Device License COMPLETED

### Financial Info Display (Phase 1 UI Only)

Each step displays:
- Government fees (رسوم) — shown in warning color
- Office profit (أتعاب) — shown in success color

### Dependencies & Landmines

**Landmines:**
1. Supabase RLS policies must be carefully written — wrong policy = data leakage
2. Phase 1 workflow UI is READ-ONLY skeleton — no state transitions yet
3. Auth middleware must handle both client-side session check AND server-side JWT validation
4. Arabic RTL requires `dir="rtl"` and proper text alignment (text-align: right)

**Dependencies:**
- Phase 1 creates foundation tables that Phase 2+ depend on
- Schema changes after data exists require migration strategy

### Validation Architecture

Phase 1 does not implement validation/metrics (deferred to later phases), but the UI skeleton should display placeholder metric cards that match the demo KPI layout.

---

## Research Sources

- `rakhtety-erp-demo.html` — UI patterns, CSS tokens, component structure
- `.planning/CONTEXT.md` — Implementation decisions (D-01 through D-10)
- `.planning/REQUIREMENTS.md` — Phase 1 requirements: CRM-01, CRM-02, CRM-03, CRM-04, AUTH-01, AUTH-02, AUTH-03, AUTH-04, WF-01 (UI), WF-04 (UI), WF-05 (UI), EMP-01, EMP-02

---

## Web Research Findings (2026-04-28)

### Supabase Auth & RLS Best Practices

**Four-part anatomy of a working RLS policy:**
1. **Operation** — `SELECT`, `INSERT`, `UPDATE`, or `DELETE`
2. **Role** — usually `authenticated`
3. **USING clause** — filters which existing rows are visible
4. **WITH CHECK clause** — validates new or modified rows

**Three core policy patterns cover ~90% of SaaS:**
- User ownership (users edit only their own rows)
- Multi-tenant isolation (tenants cannot see each other's data)
- Admin roles (privileged read access)

**Performance trap warning:** RLS queries can degrade from **0.1ms to 11 seconds** under load with large tables (1M+ rows) if not properly indexed.

**Security best practice:** Separate policies for OAuth clients vs regular users:

```sql
-- User access
CREATE POLICY "Users access their own data"
ON user_data FOR ALL
USING (
  auth.uid() = user_id AND
  (auth.jwt() ->> 'client_id') IS NULL
);

-- OAuth client access (separate policy)
CREATE POLICY "OAuth clients limited access"
ON user_data FOR SELECT
USING (
  auth.uid() = user_id AND
  (auth.jwt() ->> 'client_id') IN ('client-1', 'client-2')
);
```

**Always use `TO authenticated` clause** to prevent anonymous access:
```sql
CREATE POLICY "Users can access their own records" on rls_test
TO authenticated
USING ( (select auth.uid()) = user_id );
```

### Next.js 16 (v16.2.2)

**New in Next.js 16:**
- `cacheComponents` approach replaces experimental PPR from Next.js 15
- If using PPR in Next.js 15, stay on canary until ready to migrate
- App Router continues to be the recommended approach
- Backward compatible with Pages Router

**Project Structure (App Router):**
```
src/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── clients/
│   │   ├── workflows/
│   │   ├── employees/
│   │   └── settings/
│   └── api/
├── components/
│   ├── ui/
│   ├── forms/
│   └── layout/
├── lib/
│   ├── supabase/
│   └── utils/
└── types/
```

**Tech Stack:** Next.js 16, React 19, Tailwind CSS, TypeScript, ESLint, Clerk Auth, DrizzleORM

### HTML to React Migration

**JSX differs from HTML in 5 categories:**

| Category | HTML | JSX |
|----------|------|-----|
| Reserved keywords | `class`, `for` | `className`, `htmlFor` |
| Event handlers | `onclick="fn()"` | `onClick={fn}` |
| Boolean/camelCase attrs | `tabindex`, `readonly` | `tabIndex`, `readOnly` |
| Inline styles | `style="color:red"` | `style={{ color: 'red' }}` |
| Void elements | `<br>`, `<img>` | `<br />`, `<img />` |

**Additional differences:**
- Comments: `<!-- ... -->` becomes `{/* ... */}`
- All attribute names use camelCase (e.g., `maxLength`, `colSpan`, `rowSpan`, `contentEditable`, `crossOrigin`)

**Migration strategy:** Incremental migration with clear boundaries. Keep legacy HTML working during transition, migrate page-by-page. Use automated converters to avoid manual mistakes.

---

## Validation Architecture

*Note: Full validation/metrics implementation is Phase 5 scope. Phase 1 establishes the data model.*

