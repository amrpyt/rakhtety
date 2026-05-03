## Context

The current frontend still imports Supabase client/admin/proxy helpers and reads Supabase environment variables during build and runtime. The backend spike proved the Frappe app can serve the workflow data the UI needs, so the frontend should stop talking to Supabase directly.

The intent is not to change the UX. The intent is to swap the data layer and auth/session plumbing so the app has one backend story.

## Goals / Non-Goals

**Goals:**

- Remove Supabase from the frontend execution path.
- Make Frappe the single source of backend data for the app UI.
- Preserve current screens and workflow behavior.
- Keep build and production deployment simpler by deleting unused Supabase secrets from the frontend stack.

**Non-Goals:**

- Rebuild the UI.
- Move unrelated Supabase projects or data outside this repo.
- Change the Frappe custom app contract unless needed to support the frontend.

## Decisions

### Decision: Introduce a single Frappe API adapter

Replace direct Supabase reads/writes with one internal adapter that talks to the Frappe backend. That keeps the UI/services stable while the backend implementation changes under one seam.

Alternative considered: rewrite every route to call Frappe directly without a seam. That is faster for one pass, but harder to keep consistent across many routes.

### Decision: Keep frontend auth as a Frappe-backed session

Use Frappe as the session source for the frontend instead of Supabase session state. That avoids maintaining two auth systems.

Alternative considered: keep Supabase auth just for login. That would preserve the old login path but defeats the goal of removing Supabase from the equation.

### Decision: Migrate route by route

Move client/workflow/employee/document/dashboard routes one group at a time, starting with the shared repository layer, then service layer, then API routes and hooks.

Alternative considered: big-bang rewrite. Rejected because it is too risky and would hide breakage until late.

## Risks / Trade-offs

- [Risk] Hidden dependency on Supabase sessions or cookies -> [Mitigation] inventory auth imports first and replace them with Frappe session calls or a local session wrapper.
- [Risk] Some routes still expect Supabase-shaped return objects -> [Mitigation] keep adapter output shaped like the current DTOs until the UI is fully migrated.
- [Risk] Login/logout behavior may change -> [Mitigation] keep auth smoke tests and Browser Use checks around the full login flow.
- [Risk] Data source mismatch between old mock behavior and Frappe records -> [Mitigation] verify client/workflow/document/employee records against the custom Frappe app before deleting fallback code.

## Migration Plan

1. Inventory all Supabase imports, configs, and env variables.
2. Add a Frappe adapter layer for the shared data operations.
3. Redirect repositories and services to the adapter.
4. Replace auth/session helpers with Frappe-backed session logic.
5. Remove Supabase-specific routes and env requirements that are no longer used.
6. Run typecheck, lint, unit tests, and Browser Use smoke on localhost.
7. Delete leftover Supabase-only code after the Frappe path passes.

## Open Questions

- Should login remain username/password, magic link, or another Frappe-backed flow?
- Which exact Frappe endpoints should the adapter call for each current repository method?
- Do we keep any temporary compatibility shim while the last route migrates, or remove everything in one pass after local proof?
