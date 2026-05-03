## 1. Inventory

- [x] 1.1 List every Supabase import, config, env var, and route in the frontend.
- [x] 1.2 Identify which current routes can map directly to Frappe endpoints.

## 2. Frappe Adapter

- [x] 2.1 Add a small frontend adapter for Frappe read/write calls.
- [x] 2.2 Replace shared repository and service calls with the adapter.
- [x] 2.3 Preserve current DTO shapes where the UI already depends on them.

## 3. Auth and Session

- [x] 3.1 Replace Supabase session helpers with a Frappe-backed session flow.
- [x] 3.2 Update login/logout routes and provider state to use the new session source.
- [x] 3.3 Remove Supabase-only auth assumptions from middleware and hooks.

## 4. Cleanup

- [x] 4.1 Remove unused Supabase SDK setup and environment validation.
- [ ] 4.2 Remove dead Supabase-only files after the Frappe path is wired.
- [x] 4.3 Update Docker and production templates so frontend builds no longer need Supabase secrets.

## 5. Verification

- [x] 5.1 Run `pnpm typecheck`, `pnpm lint`, and relevant tests.
- [x] 5.2 Build the frontend locally without Supabase environment variables.
- [x] 5.3 Use Browser Use in headed mode to verify login, dashboard, client workflow, document upload, and logout on localhost.
- [x] 5.4 Update `learning.md` with the migration notes and final decision.
- [x] 5.5 Commit the completed migration after checks pass.
