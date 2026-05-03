## Why

The dashboard shell can hydrate with different sidebar markup than the server rendered when the browser already has a local auth session. React and Next.js treat this as a bug because the first client render must match the server HTML.

## What Changes

- Make auth context render the same initial user state on the server and the first browser render.
- Load the browser-only local session after hydration instead of during the initial render.
- Keep route visibility, profile display, login, and logout behavior unchanged after the auth state loads.
- Add focused coverage for the auth provider startup behavior.

## Capabilities

### New Capabilities

- `dashboard-shell-hydration`: Dashboard navigation and auth shell rendering must not create server/client hydration mismatches.

### Modified Capabilities

- None.

## Impact

- Affected code: `src/providers/AuthProvider.tsx`, dashboard layout consumers, and focused auth tests.
- No API, database, dependency, or route contract changes.
