## Context

`AuthProvider` currently initializes `user` by reading `document.cookie` through `readLocalSessionCookie()`. During server rendering there is no `document`, so the initial user is `null`. During the first browser render, `document.cookie` can contain the local session, so the initial user is populated before hydration finishes.

The dashboard `Sidebar` and `MobileNav` filter navigation items from `user.role`. A `null` server user and a populated browser user create different nav markup, which causes the reported hydration mismatch.

## Goals / Non-Goals

**Goals:**

- Keep server HTML and the first browser render structurally identical.
- Restore the local browser session immediately after hydration.
- Preserve current login, logout, route gating, and role-based nav rules after auth state is available.
- Add a focused regression test for the provider startup contract.

**Non-Goals:**

- Replace the local session cookie format.
- Change Supabase auth APIs or server route protection.
- Disable SSR for the dashboard shell.
- Hide hydration warnings with `suppressHydrationWarning`.

## Decisions

- Initialize `AuthProvider` with `user: null` on every environment. This makes the server render and the first browser render match.
- Read the browser cookie through `useSyncExternalStore` with a `null` server snapshot. React uses the server snapshot during SSR and hydration, then a small client subscription pulse asks React to read the browser snapshot after hydration.
- Keep `Sidebar` and `MobileNav` role filtering unchanged. The bug is the timing of auth bootstrap, not the permission matrix.
- Test by server-rendering the provider while a fake browser `document.cookie` exists. The rendered output must still show no user, proving browser-only session data does not affect initial markup.

## Risks / Trade-offs

- Authenticated users may see a brief empty or limited shell before the browser snapshot restores their session. This is acceptable for a small client-only auth bootstrap and avoids a structural hydration bug.
- If future work wants zero flicker, the better upgrade is passing a server-read initial session into `AuthProvider` from the root layout. That is a larger server auth contract change and is outside this fix.
