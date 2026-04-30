# Coding Conventions

**Analysis Date:** 2026-05-01

## Naming Patterns

**Files:**
- Use kebab-case or domain-name files for services, repositories, and helpers: `src/lib/services/workflow-action.service.ts`, `src/lib/database/repositories/workflow-step.repository.ts`, `src/lib/services/document-helpers.ts`.
- Use PascalCase files for React components: `src/components/ui/Button.tsx`, `src/components/client/ClientTable.tsx`, `src/components/layout/Sidebar.tsx`.
- Use camelCase hook files prefixed with `use`: `src/hooks/useClients.ts`, `src/hooks/useDocuments.ts`, `src/hooks/auth/useSession.ts`.
- Use Next.js App Router reserved names for routes and layouts: `src/app/layout.tsx`, `src/app/(dashboard)/layout.tsx`, `src/app/api/clients/route.ts`.
- Keep test files beside the implementation with `.test.ts`: `src/lib/services/workflow.service.test.ts`, `src/app/api/clients/route.test.ts`.

**Functions:**
- Use camelCase for normal functions and methods: `parseClientCreateRequest` in `src/app/api/clients/request-parser.ts`, `validateDocumentFile` in `src/lib/services/document-helpers.ts`.
- Use PascalCase for React components: `Button` in `src/components/ui/Button.tsx`, `ClientTable` in `src/components/client/ClientTable.tsx`.
- Use `use` prefix for React hooks: `useClients` in `src/hooks/useClients.ts`.
- Use `create*`, `build*`, `find*`, `get*`, `assert*`, and `validate*` verbs consistently for factory, formatting, lookup, guard, and validation code: `buildClientIntakeStoragePath` in `src/lib/services/document-helpers.ts`, `WorkflowActionService.assertReason` in `src/lib/services/workflow-action.service.ts`, `ClientRepository.findById` in `src/lib/database/repositories/client.repository.ts`.

**Variables:**
- Use camelCase for local variables and object fields created in TypeScript code: `searchQuery`, `setSearchResults`, and `isSearching` in `src/hooks/useClients.ts`.
- Preserve database snake_case fields when talking to Supabase or typed database rows: `workflow_id`, `created_by`, `parcel_number`, and `completed_at` in `src/lib/database/repositories/client.repository.ts` and `src/lib/services/workflow.service.ts`.
- Use UPPER_SNAKE_CASE for module constants: `BUCKET` in `src/app/api/clients/route.ts`.

**Types:**
- Use PascalCase for interfaces, classes, and type aliases: `CreateClientDto` in `src/lib/services/client.service.ts`, `WorkflowDependencyStatus` in `src/lib/services/workflow.service.ts`, `AppErrorOptions` in `src/lib/errors/app-error.class.ts`.
- Use `I*Repository` only where repository interfaces already use it: `IClientRepository` in `src/lib/database/repositories/client.repository.ts`.
- Use explicit return interfaces for hooks: `UseClientsReturn` in `src/hooks/useClients.ts`.

## Code Style

**Formatting:**
- No Prettier config is detected. Follow the existing style from `src/lib/services/workflow.service.ts` and `src/components/ui/Button.tsx`.
- Use two-space indentation.
- Omit semicolons.
- Use single quotes in TypeScript and TSX imports/strings.
- Prefer trailing commas only where the surrounding code already uses multiline object or array syntax.
- Keep JSX props readable by splitting dense components across lines, as in `src/components/client/ClientTable.tsx`.

**Linting:**
- ESLint 9 is configured in `eslint.config.mjs`.
- Use Next.js core-web-vitals and TypeScript rules from `eslint-config-next`.
- The project downgrades these React hook rules to warnings in `eslint.config.mjs`: `react-hooks/preserve-manual-memoization`, `react-hooks/set-state-in-effect`.
- Run lint with:

```bash
pnpm lint
```

**TypeScript:**
- Strict TypeScript is enabled in `tsconfig.json`.
- Use `allowJs: false`; new source files should be `.ts` or `.tsx`, not `.js`.
- Use `moduleResolution: bundler` and path aliases from `tsconfig.json`.
- Import app code through `@/*` or `@lib/*` rather than long relative paths when crossing directories.

## Import Organization

**Order:**
1. Framework and platform imports first: `react`, `next/server`, `node:path`.
2. App value imports through aliases: `@/lib/services/client.service`, `@/components/ui/Table`.
3. Relative imports for same-folder files: `./request-parser`, `./workflow.service`.
4. Type-only imports near the related value imports using `import type`: `src/hooks/useClients.ts`, `src/lib/services/workflow.service.ts`.

**Path Aliases:**
- `@/*` maps to `src/*` in `tsconfig.json` and `vitest.config.ts`.
- `@lib/*` maps to `src/lib/*` in `tsconfig.json`.
- Tests use the same `@` alias through `vitest.config.ts`, for example `src/lib/services/workflow.service.test.ts`.

## Error Handling

**Patterns:**
- Use domain errors for service-level failures: `AppError`, `ValidationError`, and `NotFoundError` live in `src/lib/errors/app-error.class.ts`.
- Throw `NotFoundError` when a service cannot find a required row before mutating data: `ClientService.findById` in `src/lib/services/client.service.ts`, `WorkflowService.getWithSteps` in `src/lib/services/workflow.service.ts`.
- Throw `AppError` with `ErrorCodes` for business rules and workflow transitions: `WorkflowService.createWithSteps` in `src/lib/services/workflow.service.ts`, `WorkflowActionService.apply` in `src/lib/services/workflow-action.service.ts`.
- Repository methods should throw Supabase errors directly after checking known empty-result codes: `ClientRepository.findById` ignores `PGRST116` and throws other errors in `src/lib/database/repositories/client.repository.ts`.
- API routes should convert unknown errors to user-facing JSON using local helpers, as in `getErrorMessage` and `getErrorStatus` in `src/app/api/clients/route.ts`.
- React hooks should keep user-facing error state as `string | null`, as in `src/hooks/useClients.ts`.

## Logging

**Framework:** console

**Patterns:**
- Logging is minimal. Use `console.warn` only for recoverable operational gaps, such as the missing `workflow_action_logs` migration fallback in `src/lib/services/workflow-action.service.ts`.
- Do not add noisy console output in normal service, repository, hook, or component paths.

## Comments

**When to Comment:**
- Most files use self-describing names and little inline commenting. Prefer clear function names and small helpers over comments.
- Add comments only for non-obvious behavior, especially compatibility fallbacks or domain rules.

**JSDoc/TSDoc:**
- JSDoc/TSDoc is not a common pattern in the current codebase.
- Prefer exported TypeScript interfaces and expressive method names over doc blocks.

## Function Design

**Size:** Keep pure calculation helpers and validation functions small. Larger service methods are acceptable when they coordinate a full business action, such as `WorkflowActionService.apply` in `src/lib/services/workflow-action.service.ts` or `POST` in `src/app/api/clients/route.ts`.

**Parameters:** Use object parameters for actions with multiple inputs, such as `EmergencyStepActionInput` in `src/lib/services/workflow.service.ts` and `ApplyWorkflowStepActionInput` in `src/lib/services/workflow-action.service.ts`. Use positional parameters for simple repository lookups like `ClientRepository.findById(id)` in `src/lib/database/repositories/client.repository.ts`.

**Return Values:** Return typed domain objects or arrays from services and repositories. Return `null` for optional lookups at repository boundaries, then convert missing required rows into `NotFoundError` in services.

## Module Design

**Exports:** Use named exports for classes, functions, constants, and singleton instances. Common pattern:

```typescript
export class ClientService {
  // service methods
}

export const clientService = new ClientService()
```

Reference: `src/lib/services/client.service.ts`.

**Barrel Files:** Barrel files are not a dominant pattern. Import directly from concrete modules such as `src/components/ui/Button.tsx`, `src/lib/services/workflow.service.ts`, and `src/types/database.types.ts`.

## React And UI Patterns

**Client Components:**
- Add `'use client'` only to components that need browser-side behavior, as in `src/components/client/ClientTable.tsx` and `src/components/auth/LoginForm.tsx`.
- Keep reusable UI primitives in `src/components/ui/`, with typed props and variant maps like `variantStyles` and `sizeStyles` in `src/components/ui/Button.tsx`.
- Keep domain UI under feature folders such as `src/components/client/`, `src/components/workflow/`, `src/components/documents/`, and `src/components/financial/`.

**Hooks:**
- Put reusable browser data logic in `src/hooks/`.
- Hooks should expose data, loading flags, error state, and command functions, following `UseClientsReturn` in `src/hooks/useClients.ts`.
- Use `useCallback` for functions returned from hooks and `useEffect` for initial fetch or debounce behavior.

**RTL And Arabic UI:**
- The root layout owns document direction. Keep RTL setup centralized in `src/app/layout.tsx`.
- Use `dir="ltr"` only for left-to-right fragments such as phone numbers, as in `src/components/client/ClientTable.tsx`.
- Keep user-facing validation and domain messages centralized when possible in `src/lib/domain/messages.ts`.

## Data And Domain Patterns

**Service Layer:**
- Place business rules in `src/lib/services/`.
- Services should call repositories, validate domain rules, and return typed domain results. Examples: `src/lib/services/workflow.service.ts`, `src/lib/services/client.service.ts`.

**Repository Layer:**
- Place Supabase table access in `src/lib/database/repositories/`.
- Repositories should own table names and query details, as in `ClientRepository.table` in `src/lib/database/repositories/client.repository.ts`.
- Keep database field names in snake_case at repository boundaries to match `src/types/database.types.ts`.

**Validation:**
- Put shared schemas in `src/lib/validation/schemas.ts`.
- API routes should validate parsed request input before creating records, as in `src/app/api/clients/route.ts`.
- File validation lives near document helpers in `src/lib/services/document-helpers.ts`.

---

*Convention analysis: 2026-05-01*
