---
status: issues_found
phase: 06
phase_name: client-reporting-polish
depth: standard
files_reviewed: 14
findings:
  critical: 0
  warning: 2
  info: 0
  total: 2
---

# Code Review: Phase 06

## Summary

Reviewed the current uncommitted source changes around the Next.js 16 upgrade, Supabase auth changes, document preview flow, and related config updates.

## Findings

### WR-01 [P1] Logout reports success even when Supabase sign-out fails

**File:** `src/app/api/auth/logout/route.ts`
**Line:** 6

`supabase.auth.signOut()` returns an `{ error }` result instead of throwing for normal auth failures, but the route ignores that result and always returns `{ ok: true }`. If Supabase cannot clear the auth session, the browser keeps the server auth cookies, the client thinks logout succeeded, and middleware can send the user straight back to `/dashboard`.

### WR-02 [P2] Generated route types are imported from `next-env.d.ts`

**File:** `next-env.d.ts`
**Line:** 3

The direct import of `./.next/types/routes.d.ts` makes `pnpm typecheck` depend on generated `.next` files being present and fresh. A clean checkout or stale `.next` directory can fail typecheck before `next build` has regenerated those files.

## Recommended Next Steps

1. Return a non-2xx response from `/api/auth/logout` when `signOut()` returns an error, and make the client respect that response.
2. Remove the generated `.next/types/routes.d.ts` import from committed source or make typecheck run Next type generation first.
