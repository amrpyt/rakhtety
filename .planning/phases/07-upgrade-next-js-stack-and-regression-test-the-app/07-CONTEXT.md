# Phase 7: Upgrade Next.js stack and regression test the app - Context

**Gathered:** 2026-05-03
**Status:** Ready for planning
**Mode:** Auto-selected defaults via GSD autonomous flow

<domain>
## Phase Boundary

Make the current Next.js Rakhtety app production-ready by validating the upgraded stack, fixing build/type/lint/test failures, checking deployment readiness, and proving the main office workflows still work in Browser Use. This phase does not rebuild the product on another platform.

</domain>

<decisions>
## Implementation Decisions

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

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Product and workflow rules
- `.planning/STATE.md` - Current milestone state and recent work notes.
- `.planning/ROADMAP.md` - Phase list and success criteria.
- `.planning/REQUIREMENTS.md` - Product requirements.
- `AGENTS.md` - Project communication rules, RTL rules, RLS rules, workflow order, and test account notes.

### Prior phase evidence
- `.planning/phases/06-client-reporting-polish/06-VERIFICATION.md` - Latest Phase 6 verification status.
- `.planning/phases/06-client-reporting-polish/06-REVIEW.md` - Latest review notes if present.
- `.planning/phases/06-client-reporting-polish/06-UAT.md` - Latest UAT notes if present.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/lib/services/` contains the business rules. Treat these as the source of truth for workflow and finance behavior.
- `src/hooks/` bridges UI clicks to services. Regression fixes should preserve hook contracts unless tests show a broken contract.
- `src/components/` contains the current shadcn-style UI pieces. Keep visual fixes consistent with these components.

### Established Patterns
- Supabase server/client helpers live under `src/lib/supabase/`.
- Dashboard routes live under `src/app/(dashboard)/`.
- Database migrations live under `supabase/migrations/`.

### Integration Points
- Auth touches middleware, login/logout APIs, Supabase helpers, and browser storage/cookies.
- Reports touch client data, workflow progress, finance summaries, and PDF generation.
- Browser E2E checks must use real seeded/test accounts noted in `AGENTS.md`.

</code_context>

<specifics>
## Specific Ideas

- Keep the app as an Arabic office operations tool, not a marketing page.
- Use simple production gates: `pnpm lint`, `pnpm test`, `pnpm typecheck`, `pnpm build`, then Browser Use smoke checks.
- Commit every finished edit round only after checks pass.

</specifics>

<deferred>
## Deferred Ideas

- Full Frappe ERPNext rebuild belongs to Phase 8 and is not part of making this Next.js app production-ready.

</deferred>

---

*Phase: 07-upgrade-next-js-stack-and-regression-test-the-app*
*Context gathered: 2026-05-03*
