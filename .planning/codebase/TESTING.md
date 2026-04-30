# Testing Patterns

**Analysis Date:** 2026-05-01

## Test Framework

**Runner:**
- Vitest 4.1.5
- Config: `vitest.config.ts`
- The config only defines the `@` alias to `src/`; no custom environment, setup file, or coverage rules are configured.

**Assertion Library:**
- Vitest built-in `expect`, imported from `vitest`.
- Mocking uses Vitest `vi`, imported from `vitest`.

**Run Commands:**
```bash
pnpm test              # Run all tests once with vitest run
pnpm vitest            # Run Vitest directly if an ad hoc watch/debug run is needed
pnpm lint              # Run ESLint across the repo
pnpm typecheck         # Run Next type generation and TypeScript no-emit checks
```

## Test File Organization

**Location:**
- Tests are co-located with implementation files.
- Service tests live beside services: `src/lib/services/workflow.service.test.ts`, `src/lib/services/document.service.test.ts`, `src/lib/services/financial.service.test.ts`, `src/lib/services/dashboard-analytics.test.ts`.
- Repository tests live beside repositories: `src/lib/database/repositories/workflow-step.repository.test.ts`.
- API parser tests live beside route/parser code: `src/app/api/clients/route.test.ts`.

**Naming:**
- Use `.test.ts` for test files.
- No `.spec.ts` or `.test.tsx` files are detected under `src/`.

**Structure:**
```text
src/
├── app/
│   └── api/
│       └── clients/
│           ├── request-parser.ts
│           ├── route.ts
│           └── route.test.ts
└── lib/
    ├── database/
    │   └── repositories/
    │       ├── workflow-step.repository.ts
    │       └── workflow-step.repository.test.ts
    └── services/
        ├── workflow.service.ts
        ├── workflow.service.test.ts
        ├── document.service.test.ts
        ├── financial.service.test.ts
        └── dashboard-analytics.test.ts
```

## Test Structure

**Suite Organization:**
```typescript
import { describe, expect, it } from 'vitest'
import { calculateTotalsFromSteps } from './financial-calculations'

describe('financial calculations', () => {
  it('calculates totals from workflow step snapshots', () => {
    expect(calculateTotalsFromSteps([{ fees: 300, profit: 100 }])).toEqual({
      total_cost: 400,
      total_fees: 300,
      planned_profit: 100,
    })
  })
})
```

Reference pattern: `src/lib/services/financial.service.test.ts`.

**Patterns:**
- Use one top-level `describe` per module or behavior area.
- Use behavior-focused `it(...)` names, for example `it('blocks pending to completed')` in `src/lib/database/repositories/workflow-step.repository.test.ts`.
- Build small local factory helpers for typed fixtures, such as `step`, `workflow`, and `employee` in `src/lib/services/dashboard-analytics.test.ts`.
- Assert thrown errors with `toThrow` for synchronous validation in `src/lib/services/document.service.test.ts`.
- Assert async success/failure with `await expect(...).resolves` and `await expect(...).rejects` in `src/lib/services/workflow.service.test.ts`.

## Mocking

**Framework:** Vitest `vi`

**Patterns:**
```typescript
import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockFindStepById } = vi.hoisted(() => ({
  mockFindStepById: vi.fn(),
}))

vi.mock('@/lib/database/repositories/workflow-step.repository', () => ({
  workflowStepRepository: {
    findById: mockFindStepById,
  },
}))

import { workflowService } from './workflow.service'
```

Reference pattern: `src/lib/services/workflow.service.test.ts`.

**What to Mock:**
- Mock repositories when testing service orchestration. Example: `workflowStepRepository`, `workflowRepository`, and `workflowActionLogRepository` are mocked in `src/lib/services/workflow.service.test.ts`.
- Mock Supabase clients when testing repository methods that do not need real network/database access. Example: `src/lib/database/repositories/workflow-step.repository.test.ts` mocks `@/lib/supabase/client`.
- Mock nondeterministic platform APIs when asserting exact output. Example: `crypto.randomUUID` is spied in `src/lib/services/document.service.test.ts`.

**What NOT to Mock:**
- Do not mock pure calculation helpers. Test `calculateTotalsFromSteps`, `calculateRealizedProfit`, and `getSignedEventAmount` directly as in `src/lib/services/financial.service.test.ts`.
- Do not mock small local fixture factories. Keep them as plain functions in the test file, as in `src/lib/services/dashboard-analytics.test.ts`.
- Do not mock browser `Request`, `FormData`, or `File` for parser tests when the runtime provides them. `src/app/api/clients/route.test.ts` uses real `Request`, `FormData`, and `File`.

## Fixtures and Factories

**Test Data:**
```typescript
function step(overrides: Partial<WorkflowStepWithEmployee>): WorkflowStepWithEmployee {
  return {
    id: overrides.id || 'step-1',
    workflow_id: overrides.workflow_id || 'workflow-1',
    status: overrides.status || 'in_progress',
    assigned_to: overrides.assigned_to ?? 'user-1',
    completed_at: overrides.completed_at ?? null,
    fees: overrides.fees ?? 0,
    profit: overrides.profit ?? 0,
    created_at: overrides.created_at || '2026-04-01T10:00:00.000Z',
    updated_at: overrides.updated_at || '2026-04-20T10:00:00.000Z',
  } as WorkflowStepWithEmployee
}
```

Reference pattern: `src/lib/services/dashboard-analytics.test.ts`.

**Location:**
- Fixtures are local to each test file.
- No shared `test/`, `__fixtures__/`, or `src/test-utils/` directory is detected.
- Keep new fixtures local until at least two test files need the same data shape.

## Coverage

**Requirements:** None enforced. No coverage threshold or coverage reporter is configured in `vitest.config.ts` or `package.json`.

**View Coverage:**
```bash
pnpm vitest run --coverage
```

This command may require adding Vitest coverage support if the local install does not already include it.

## Test Types

**Unit Tests:**
- Current tests are mostly unit tests for pure functions, service rules, parser behavior, and repository helper logic.
- Examples: `src/lib/services/financial.service.test.ts`, `src/lib/services/dashboard-analytics.test.ts`, `src/lib/database/repositories/workflow-step.repository.test.ts`.

**Integration Tests:**
- Lightweight API parser integration exists in `src/app/api/clients/route.test.ts`. It constructs real `Request` and `FormData` objects, then calls `parseClientCreateRequest`.
- No tests currently hit a real Supabase instance.

**E2E Tests:**
- No committed Playwright, Cypress, or Browser Use E2E test suite is detected.
- Project guidance says browser E2E checks should use Browser Use. Keep those checks as verification workflow unless a committed E2E suite is added.

## Common Patterns

**Async Testing:**
```typescript
await expect(
  workflowService.emergencyCompleteStep('step-1', {
    reason: 'Urgent municipal deadline',
    actorId: 'employee-1',
  })
).resolves.toMatchObject({
  id: 'step-1',
  status: 'completed',
})
```

Reference pattern: `src/lib/services/workflow.service.test.ts`.

**Error Testing:**
```typescript
await expect(
  workflowService.emergencyCompleteStep('step-1', {
    reason: '   ',
    actorId: 'employee-1',
  })
).rejects.toMatchObject({
  code: ErrorCodes.VALIDATION_FAILED,
})
```

Reference pattern: `src/lib/services/workflow.service.test.ts`.

**Synchronous Validation Testing:**
```typescript
expect(() => validateDocumentFile(file)).toThrow('expected message')
```

Reference pattern: `src/lib/services/document.service.test.ts`.

**Parser Testing:**
```typescript
const request = new Request('http://localhost/api/clients', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'E2E Upload Client' }),
})

const parsed = await parseClientCreateRequest(request)

expect(parsed.intakeFiles.size).toBe(0)
```

Reference pattern: `src/app/api/clients/route.test.ts`.

## Adding New Tests

**Services:**
- Put service tests beside the service file in `src/lib/services/`.
- Mock repository dependencies with `vi.mock`.
- Use `beforeEach(() => vi.clearAllMocks())` when mocks are shared across tests.

**Repositories:**
- Put repository tests beside the repository file in `src/lib/database/repositories/`.
- Mock `@/lib/supabase/client` unless the test intentionally uses a real database.
- Prefer testing pure repository methods, transition validation, and query-shape helpers without network calls.

**API Routes And Parsers:**
- Extract parse/validation logic into a helper like `src/app/api/clients/request-parser.ts`.
- Test the helper directly with real Web API objects before testing the full Next route.

**UI And Hooks:**
- No React component testing library is configured. Before adding component or hook tests, add the required test environment and document it in `vitest.config.ts`.

---

*Testing analysis: 2026-05-01*
