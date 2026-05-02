# Phase 7: Upgrade Next.js Stack and Regression Test the App - Pattern Map

**Mapped:** 2026-05-03  
**Files analyzed:** 15 target areas  
**Analogs found:** 15 / 15

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `package.json` | config | batch | `package.json` | exact |
| `next.config.mjs` | config | build | `next.config.mjs` | exact |
| `eslint.config.mjs` | config | batch | `eslint.config.mjs` | exact |
| `vitest.config.ts` | config | batch | `vitest.config.ts` | exact |
| `open-next.config.ts` | config | deployment | `open-next.config.ts` | exact |
| `wrangler.jsonc` | config | deployment | `wrangler.jsonc` | exact |
| `src/app/layout.tsx` | provider | request-response | `src/app/layout.tsx` | exact |
| `src/middleware.ts` | middleware | request-response | `src/middleware.ts` | exact |
| `src/lib/supabase/server.ts` | utility | request-response | `src/lib/supabase/server.ts` | exact |
| `src/lib/supabase/client.ts` | utility | event-driven | `src/lib/supabase/client.ts` | exact |
| `src/providers/AuthProvider.tsx` | provider | event-driven | `src/providers/AuthProvider.tsx` | exact |
| `src/app/api/**/route.ts` | route | request-response | `src/app/api/clients/route.ts` | exact |
| `src/hooks/**` | hook | CRUD | `src/hooks/useClients.ts` | exact |
| `src/lib/services/**` | service | CRUD | `src/lib/services/workflow.service.ts` | exact |
| `src/lib/database/repositories/**` | repository | CRUD | `src/lib/database/repositories/workflow.repository.ts` | exact |
| `src/**/*.test.ts` | test | batch | `src/lib/services/workflow.service.test.ts` | exact |
| `.planning/phases/07-*/07-VERIFICATION.md` | docs | batch | `.planning/quick/260501-30f-*/260501-30f-VERIFICATION.md` | role-match |

## Pattern Assignments

### `package.json` (config, batch)

**Analog:** `package.json`

**Scripts pattern** (lines 5-16):
```json
"scripts": {
  "build": "next build --webpack",
  "dev": "next dev",
  "start": "next start",
  "lint": "eslint .",
  "test": "vitest run",
  "typecheck": "next typegen && tsc --noEmit",
  "preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
  "deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy",
  "upload": "opennextjs-cloudflare build && opennextjs-cloudflare upload",
  "cf-typegen": "wrangler types --env-interface CloudflareEnv cloudflare-env.d.ts"
}
```

**Stack target** (lines 19-42):
```json
"@supabase/ssr": "^0.10.2",
"@supabase/supabase-js": "^2.105.1",
"next": "^16.2.4",
"react": "^19.2.5",
"react-dom": "^19.2.5",
"@opennextjs/cloudflare": "^1.19.5",
"eslint": "^9.39.4",
"eslint-config-next": "^16.2.4",
"typescript": "^6.0.3",
"vitest": "^4.1.5",
"wrangler": "^4.86.0"
```

**Apply to Phase 7:** keep the simple gate order from context: `pnpm lint`, `pnpm test`, `pnpm typecheck`, `pnpm build`, then Browser Use checks. If dependency changes happen, preserve these script names so plans and verification stay stable.

---

### `src/app/layout.tsx` (provider, request-response)

**Analog:** `src/app/layout.tsx`

**RTL and auth-provider pattern** (lines 1-20):
```tsx
import type { Metadata } from 'next'
import '@/styles/globals.css'
import { AuthProvider } from '@/providers/AuthProvider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
```

**Apply to Phase 7:** production fixes must not move `dir="rtl"` down into individual components. This file is the root Arabic direction switch.

---

### `src/middleware.ts` (middleware, request-response)

**Analog:** `src/middleware.ts`

**Route guard pattern** (lines 7-20):
```ts
const PUBLIC_ROUTES = ['/login', '/signup', '/api/auth']
const PROTECTED_ROUTES = ['/dashboard', '/clients', '/workflows', '/employees', '/finance', '/settings']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route))
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route))
  if (!isPublicRoute && !isProtectedRoute) {
    return NextResponse.next()
  }
  const { cookiesToSet, user } = await updateSession(request)
```

**Cookie forwarding pattern** (lines 22-32):
```ts
const applyCookies = (response: NextResponse) => {
  cookiesToSet.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options)
  })
  return response
}

if (isProtectedRoute && !user) {
  const redirectUrl = new URL('/login', request.url)
  redirectUrl.searchParams.set('redirect', pathname)
  return applyCookies(NextResponse.redirect(redirectUrl))
}
```

**Role gate pattern** (lines 35-58):
```ts
if (isProtectedRoute && user) {
  const supabase = createServerClient(databaseConfig.supabaseUrl, databaseConfig.supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll() {
        // updateSession already collected refreshed cookies for the response.
      },
    },
  })
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  const role = profile?.role || user.user_metadata?.role
  if (!canAccessRoute(role, pathname)) {
    return applyCookies(NextResponse.redirect(new URL('/dashboard', request.url)))
  }
}
```

**Apply to Phase 7:** auth regressions usually live here: cookie forwarding, protected-route matching, public login redirect, and employee/admin route blocking.

---

### `src/lib/supabase/server.ts` (utility, request-response)

**Analog:** `src/lib/supabase/server.ts`

**Server helper pattern** (lines 1-28):
```ts
import { cookies } from 'next/headers'
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { databaseConfig } from '@/config/database.config'

export async function createServerClient() {
  const cookieStore = await cookies()

  return createSupabaseServerClient(databaseConfig.supabaseUrl, databaseConfig.supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Server components cannot always write cookies.
        }
      },
    },
  })
}
```

**Apply to Phase 7:** keep server API routes on this helper. It owns the Next.js 16 async `cookies()` shape.

---

### `src/lib/supabase/client.ts` (utility, event-driven)

**Analog:** `src/lib/supabase/client.ts`

**Browser helper pattern** (lines 1-14):
```ts
import { createBrowserClient } from '@supabase/ssr'
import { databaseConfig } from '@/config/database.config'

export const supabase = createBrowserClient(databaseConfig.supabaseUrl, databaseConfig.supabaseAnonKey, {
  auth: {
    persistSession: databaseConfig.sessionPersistSession,
    autoRefreshToken: databaseConfig.sessionAutoRefreshToken,
    detectSessionInUrl: databaseConfig.sessionDetectSessionInUrl,
  },
})
```

**Apply to Phase 7:** browser auth and hooks should share this singleton. Do not make one-off browser clients in components.

---

### `src/providers/AuthProvider.tsx` (provider, event-driven)

**Analog:** `src/providers/AuthProvider.tsx`

**Session sync pattern** (lines 21-60):
```tsx
useEffect(() => {
  let mounted = true

  const syncSession = async (session: Session | null) => {
    if (!mounted) return
    if (!session?.user) {
      setUser(null)
      setLoading(false)
      return
    }
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle()
    if (!mounted) return
    setUser(toAuthUser(session.user, profile))
    setLoading(false)
  }

  supabase.auth.getSession().then(({ data: { session } }) => {
    void syncSession(session)
  })

  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    void syncSession(session)
  })

  return () => {
    mounted = false
    subscription.unsubscribe()
  }
}, [])
```

**Apply to Phase 7:** Browser Use should prove this picks up login state after `/api/auth/login`; otherwise the app can bounce back to `/login`.

---

### `src/app/api/**/route.ts` (route, request-response)

**Analog:** `src/app/api/clients/route.ts`

**Imports pattern** (lines 1-9):
```ts
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requirePermission } from '@/lib/auth/server-permissions'
import { createClient, listClients } from '@/lib/server-data/directory-query'
import { createServerClient } from '@/lib/supabase/server'
import { clientCreateSchema } from '@/lib/validation/schemas'
```

**GET pattern** (lines 43-52):
```ts
export async function GET(request: NextRequest) {
  const supabase = await createServerClient()
  const search = request.nextUrl.searchParams.get('q')?.trim()

  try {
    return NextResponse.json({ clients: await listClients(supabase, search) })
  } catch (error) {
    const message = getErrorMessage(error, 'Failed to fetch clients')
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
```

**POST auth/validation pattern** (lines 55-95):
```ts
export async function POST(request: NextRequest) {
  const supabase = await createServerClient()
  const permission = await requirePermission(supabase, 'manageClients')
  if (permission instanceof NextResponse) return permission

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'login required' }, { status: 401 })
  }

  const { body, intakeFiles } = await parseClientCreateRequest(request)
  const parsed = clientCreateSchema.safeParse(input)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || 'invalid data' }, { status: 400 })
  }
  const client = await createClient(supabase, parsed.data, user.id)
```

**Rollback pattern for file I/O** (lines 97-133):
```ts
const admin = createAdminClient()
const uploadedPaths: string[] = []
try {
  // upload storage file, then insert DB row
} catch (error) {
  if (uploadedPaths.length > 0) {
    await admin.storage.from(BUCKET).remove(uploadedPaths)
  }
  await admin.from('clients').delete().eq('id', client.id)
  throw error
}
```

**Apply to Phase 7:** route fixes should preserve `NextResponse.json({ error }, { status })`, permission checks, and storage rollback. Admin client is only for service-role work like storage cleanup.

---

### `src/lib/auth/server-permissions.ts` (utility, request-response)

**Analog:** `src/lib/auth/server-permissions.ts`

**Server permission pattern** (lines 11-18, 49-60):
```ts
export async function getPermissionContext(supabase: SupabaseClient): Promise<PermissionContext | NextResponse> {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'login required' }, { status: 401 })
  }
}

export async function requirePermission(supabase: SupabaseClient, action: PermissionAction) {
  const context = await getPermissionContext(supabase)
  if (context instanceof NextResponse) return context
  if (!can(context.profile.role, action)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  return context
}
```

**Apply to Phase 7:** all sensitive API routes should keep using `requirePermission`; role mistakes are production blockers.

---

### `src/hooks/**` (hook, CRUD)

**Analog:** `src/hooks/useClients.ts`

**Hook state pattern** (lines 21-39):
```ts
export function useClients(): UseClientsReturn {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchClients = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setClients(await directoryClient.listClients())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clients')
    } finally {
      setLoading(false)
    }
  }, [])
}
```

**Optimistic local update pattern** (lines 67-84):
```ts
const createClient = useCallback(async (data: CreateClientDto, intakeFiles?: Record<string, File>) => {
  const newClient = await directoryClient.createClient(data, intakeFiles)
  setClients((prev) => [newClient, ...prev])
  return newClient
}, [])

const deleteClient = useCallback(async (id: string) => {
  await clientService.delete(id)
  setClients((prev) => prev.filter((c) => c.id !== id))
}, [])
```

**Apply to Phase 7:** hook compatibility fixes should keep component contracts stable: `{ loading, error, fetch..., create... }`.

---

### `src/lib/client-data/directory-client.ts` (browser API client, CRUD/file-I/O)

**Analog:** `src/lib/client-data/directory-client.ts`

**Fetch error pattern** (lines 9-17):
```ts
async function readJson<T>(response: Response, fallbackMessage: string): Promise<T> {
  const payload = await response.json()
  if (!response.ok) {
    throw new Error(payload.error || fallbackMessage)
  }
  return payload as T
}
```

**Two-step create plus upload pattern** (lines 73-97):
```ts
async createClient(data: CreateClientDto, intakeFiles?: Record<string, File>): Promise<Client> {
  const files = intakeFiles ? Object.entries(intakeFiles).filter(([, file]) => file) : []
  for (const [, file] of files) validateIntakeFile(file)

  const payload = await readJson<{ client: Client }>(
    await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, intake_documents: documentTypes }),
    }),
    'Failed to create client'
  )

  for (const [type, file] of files) {
    await uploadClientIntakeDocument(payload.client.id, type, file)
  }
  return payload.client
}
```

**Apply to Phase 7:** regression tests must cover both JSON-only and file-upload flows. Browser Use has prior risk around visible file inputs.

---

### `src/lib/services/**` (service, CRUD)

**Analog:** `src/lib/services/workflow.service.ts`

**Business rule pattern** (lines 63-82):
```ts
async createWithSteps(data: CreateWorkflowDto, stepsData: CreateWorkflowStepsDto['steps']) {
  const existingClient = await clientRepository.findById(data.client_id)
  if (!existingClient) {
    throw new NotFoundError(domainMessages.entities.client, data.client_id)
  }

  if (data.type === 'EXCAVATION_PERMIT') {
    const dependencyStatus = await this.checkDependency(data.client_id)
    if (dependencyStatus.isBlocked) {
      throw new AppError({
        code: ErrorCodes.WORKFLOW_DEPENDENCY_NOT_MET,
        message: dependencyStatus.reason || domainMessages.workflow.deviceLicenseMustComplete,
        statusCode: 400,
      })
    }
  }
}
```

**Dependency rule pattern** (lines 147-168):
```ts
async checkDependency(clientId: string): Promise<WorkflowDependencyStatus> {
  const workflows = await workflowRepository.findByClientId(clientId)
  const deviceLicense = workflows.find((workflow) => workflow.type === 'DEVICE_LICENSE')

  if (!deviceLicense) {
    return { isBlocked: true, reason: domainMessages.workflow.deviceLicenseMissing, blockingWorkflow: 'DEVICE_LICENSE' }
  }
  if (deviceLicense.status !== 'completed') {
    return {
      isBlocked: true,
      reason: getBlockedExcavationReason(deviceLicense.status),
      blockingWorkflow: 'DEVICE_LICENSE',
      blockingWorkflowStatus: deviceLicense.status,
    }
  }
  return { isBlocked: false }
}
```

**Apply to Phase 7:** do not change business rules while upgrading. This is the key “Device License before Excavation Permit” rule.

---

### `src/lib/database/repositories/**` (repository, CRUD)

**Analog:** `src/lib/database/repositories/workflow.repository.ts`

**Repository class pattern** (lines 28-43):
```ts
export class WorkflowRepository implements IWorkflowRepository {
  private readonly table = 'workflows'

  async findById(id: string): Promise<Workflow | null> {
    const { data, error } = await supabase.from(this.table).select('*').eq('id', id).single()
    if (error && error.code !== 'PGRST116') {
      throw error
    }
    return data || null
  }
}
```

**Filtered query pattern** (lines 56-74):
```ts
async findAll(filter?: WorkflowFilter): Promise<Workflow[]> {
  let query = supabase.from(this.table).select('*')
  if (filter?.client_id) query = query.eq('client_id', filter.client_id)
  if (filter?.type) query = query.eq('type', filter.type)
  if (filter?.status) query = query.eq('status', filter.status)
  if (filter?.assigned_to) query = query.eq('assigned_to', filter.assigned_to)
  const { data, error } = await query
  if (error) throw error
  return data || []
}
```

**Nested data pattern** (lines 109-124):
```ts
async getWithSteps(id: string): Promise<WorkflowWithSteps | null> {
  const workflow = await this.findById(id)
  if (!workflow) return null
  const { data: steps, error } = await supabase
    .from(this.stepsTable)
    .select('*, assigned_employee:profiles(full_name)')
    .eq('workflow_id', id)
    .order('step_order')
  if (error) throw error
  return { ...workflow, steps: steps || [] }
}
```

**Apply to Phase 7:** repository-level fixes should preserve the simple `throw error` style and typed return values.

---

### `src/**/*.test.ts` (test, batch)

**Analog:** `src/lib/services/financial.service.test.ts`

**Pure calculation test pattern** (lines 1-37):
```ts
import { describe, expect, it } from 'vitest'
import { calculateRealizedProfit, calculateTotalsFromSteps, getSignedEventAmount } from './financial-calculations'

describe('financial calculations', () => {
  it('calculates totals from workflow step snapshots', () => {
    expect(calculateTotalsFromSteps(steps)).toEqual({
      total_cost: 1400,
      total_fees: 1000,
      planned_profit: 400,
    })
  })
})
```

**Mocked service test pattern** (source: `src/lib/services/workflow.service.test.ts`, lines 1-23, 73-83):
```ts
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockFindStepById } = vi.hoisted(() => ({
  mockFindStepById: vi.fn(),
}))

vi.mock('@/lib/database/repositories/workflow-step.repository', () => ({
  workflowStepRepository: {
    findById: mockFindStepById,
  },
}))

describe('WorkflowService emergency override', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFindStepById.mockResolvedValue({ id: 'step-1' })
  })
})
```

**Request parser test pattern** (source: `src/app/api/clients/route.test.ts`, lines 9-25, 28-61):
```ts
describe('clients API request parsing', () => {
  it('keeps JSON intake document types when files upload separately', async () => {
    const request = new Request('http://localhost/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'E2E Upload Client' }),
    })
    const parsed = await parseClientCreateRequest(request)
    expect(parsed.intakeFiles.size).toBe(0)
  })
})
```

**Apply to Phase 7:** add targeted tests only where upgrade breaks contracts. Use Vitest, `vi.hoisted` for mocks, and behavior-focused `it(...)` names.

---

### Deployment config (config, deployment)

**Analogs:** `open-next.config.ts`, `wrangler.jsonc`, `next.config.mjs`

**Next config pattern** (source: `next.config.mjs`, lines 1-6):
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true
}

export default nextConfig
```

**OpenNext pattern** (source: `open-next.config.ts`, lines 1-7):
```ts
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
});
```

**Wrangler pattern** (source: `wrangler.jsonc`, lines 1-18, 28-43):
```jsonc
{
  "main": ".open-next/worker.js",
  "name": "rakhtety",
  "compatibility_date": "2026-04-29",
  "compatibility_flags": ["nodejs_compat", "global_fetch_strictly_public"],
  "vars": {
    "NEXT_PUBLIC_SUPABASE_URL": "set-in-cloudflare-dashboard",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "set-in-cloudflare-dashboard"
  },
  "assets": { "directory": ".open-next/assets", "binding": "ASSETS" },
  "r2_buckets": [{ "binding": "NEXT_INC_CACHE_R2_BUCKET", "bucket_name": "rakhtety-opennext-cache" }],
  "images": { "binding": "IMAGES" }
}
```

**Apply to Phase 7:** local production readiness is `pnpm build`; Cloudflare readiness is `pnpm preview` or `pnpm deploy` as far as local tooling allows. If blocked, record exact command and error.

---

### Browser Use / E2E verification artifact (docs, batch)

**Analog:** `.planning/quick/260501-30f-simulate-full-office-e2e-flows-for-admin/260501-30f-VERIFICATION.md`

**Browser Use smoke table pattern** (lines 3-17):
```md
## Browser Use Checks

| Flow | Result | Notes |
|---|---:|---|
| Admin login | PASS | Fresh admin account reached `/dashboard`. |
| Admin navigation | PASS | Employees nav was visible. |
| Client creation | PASS | Created client with required intake documents. |
| Device License dependency | PASS | Excavation was locked before Device License completed. |
| Employee login | PASS | Fresh employee account reached `/dashboard`. |
| Employee restrictions | PASS | Employees nav hidden; `/employees` did not expose employee management. |
| Employee workflow work | PASS | Employee started/completed Device License steps and uploaded documents. |
| Employee payment | PASS | Employee recorded `250` payment and financial totals updated. |
| Report access | PASS | Report showed client data, workflows, paid amount, and debt. |
| Excavation unlock | PASS | Excavation unlocked only after Device License was complete. |
```

**Residual risk pattern** (lines 25-27):
```md
## Remaining Risk

- Browser Use file inputs did not reliably trigger the React Hook Form upload state, so the run used browser-context API uploads with valid PDF files.
```

**Apply to Phase 7:** final verification should cover admin and employee login, dashboard, clients, workflows, finance/reporting, role gates, Device-License-before-Excavation, and file upload risk.

## Shared Patterns

### Auth/session

**Sources:** `src/middleware.ts`, `src/lib/supabase/server.ts`, `src/providers/AuthProvider.tsx`

**Apply to:** middleware, all protected routes, Browser Use login checks.

Key rule: server auth uses cookie-aware Supabase helpers; browser auth uses `AuthProvider` plus `supabase.auth.getSession()` and `onAuthStateChange()`.

### Authorization

**Source:** `src/lib/auth/server-permissions.ts`

**Apply to:** all sensitive API routes and role regression tests.

Key rule: API routes call `requirePermission(supabase, action)` and return the `NextResponse` immediately when permission fails.

### Error handling

**Source:** `src/app/api/clients/route.ts`

**Apply to:** API route compatibility fixes.

Key rule: return `NextResponse.json({ error: message }, { status })`; detect RLS code `42501` as `403` where needed.

### Layering

**Sources:** `AGENTS.md`, `src/hooks/useClients.ts`, `src/lib/client-data/directory-client.ts`, `src/lib/services/workflow.service.ts`, `src/lib/database/repositories/workflow.repository.ts`

**Apply to:** all production-readiness fixes.

Key rule: UI -> hook -> browser API client/service -> API route -> service/server-data -> repository/Supabase. Do not bypass business rules in services.

### Testing gates

**Sources:** `package.json`, `vitest.config.ts`, prior verification docs.

**Apply to:** every edit round in Phase 7.

Required commands:
```powershell
pnpm lint
pnpm test
pnpm typecheck
pnpm build
```

Browser checks: use Browser Use, not ad hoc Playwright, for login and office smoke paths.

## No Analog Found

None. All Phase 7 target areas have existing code or verification artifacts to copy from.

## High-Risk Integration Points

| Point | Why Risky | Pattern Source |
|---|---|---|
| Supabase auth cookies in middleware | Login can succeed but dashboard can bounce back to `/login` if cookies/session are not picked up. | `src/middleware.ts`, `src/lib/supabase/proxy.ts`, `src/providers/AuthProvider.tsx` |
| Next.js 16 async server APIs | `cookies()` is async in the current helper; old patterns can break typecheck/build. | `src/lib/supabase/server.ts` |
| Role gates | Admin and employee views must stay different; employee must not see employee management. | `src/lib/auth/server-permissions.ts`, prior role verification |
| Workflow dependency | Excavation Permit must stay locked until Device License is completed. | `src/lib/services/workflow.service.ts` |
| RLS and service-role use | User-scoped API work must use normal server client; service role is for controlled storage/admin operations only. | `src/app/api/clients/route.ts`, `AGENTS.md` |
| File upload UX | Browser Use previously had trouble triggering visible file inputs. | quick E2E verification |
| Cloudflare/OpenNext | Phase 6 deployment was blocked by adapter/Next version compatibility; Phase 7 must re-check exact current blocker. | `open-next.config.ts`, `wrangler.jsonc`, `06-VERIFICATION.md` |
| Arabic RTL | App must keep `dir="rtl"` at root layout. | `src/app/layout.tsx`, `AGENTS.md` |

## Metadata

**Analog search scope:** `src/app`, `src/lib`, `src/hooks`, `src/providers`, config files, `supabase`, `.planning` verification docs  
**Files scanned:** app/config/planning file listing plus targeted text search; `rg` was unavailable due Windows access denial, so PowerShell search was used.  
**Pattern extraction date:** 2026-05-03
