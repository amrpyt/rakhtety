# Phase 3: Financial Layer - Context

**Gathered:** 2026-04-28
**Status:** Ready for planning
**Mode:** Auto-selected defaults with analyze tradeoffs

<domain>
## Phase Boundary

Implement financial tracking, payment recording, debt calculation, and financial KPI widgets.

This phase turns the workflow into a money-aware system. Each workflow already has step fees and office profit from Phase 2. Phase 3 adds the payment ledger, debt math, and dashboard summaries.

**Requirements:** FIN-01, FIN-02, FIN-03, FIN-04, FIN-05

**Success Criteria:**
1. Each workflow step registers government fee and office profit
2. User can record payments against workflows
3. System calculates total cost, total paid, outstanding debt per client
4. Dashboard shows total fees collected, total profit, total debt

</domain>

<decisions>
## Implementation Decisions

### Payment Shape

**Tradeoff analysis:**

| Approach | Pros | Cons |
|----------|------|------|
| One payment per workflow | Simple for users; easy receipt entry | Cannot clearly show which fee was paid |
| One payment per step | Very clear matching to workflow steps | Too strict if client pays one lump sum |
| Flexible payments with optional allocation | Handles partial payments, lump sums, and step-specific payments | Needs careful validation and UI clarity |

- **D-01:** Use flexible payment records with optional allocation to workflow steps.
  - A payment belongs to a workflow.
  - A payment can optionally point to a specific workflow step.
  - This lets the office record "client paid 2,000 EGP for the whole file" or "client paid the excavation fee step."
  - Simple meaning: one receipt can pay the whole basket, or one item inside the basket.

- **D-02:** Store each payment as an append-only financial event.
  - Do not overwrite old payment history.
  - Corrections should be new adjustment/refund events, not edits that erase the past.
  - Reason: money needs a trail. If something looks wrong later, we can see what happened.

### Debt Rules

**Tradeoff analysis:**

| Approach | Pros | Cons |
|----------|------|------|
| Calculate live from events | Accurate; no duplicate truth | Slightly more query work |
| Store running totals only | Fast dashboard reads | Easy to get wrong if one update fails |
| Store events plus optional cached summaries | Accurate source of truth with dashboard speed later | More moving parts if added too early |

- **D-03:** Calculate debt from financial events and workflow step amounts as the source of truth.
  - Total cost = sum of workflow step `fees` + `profit`.
  - Total paid = sum of payment events minus refund/adjustment events.
  - Outstanding debt = total cost - total paid.
  - Simple meaning: debt is not guessed. The app adds the bill, subtracts payments, and shows what is left.

- **D-04:** Do not introduce cached financial totals in the first Phase 3 pass.
  - Use live calculation first because MVP data size is small.
  - Add cached summaries later only if dashboard queries become slow.

### Fee Changes

**Tradeoff analysis:**

| Approach | Pros | Cons |
|----------|------|------|
| Always read latest config | Easy admin updates | Old client files silently change price |
| Snapshot fees on workflow step | Old files stay honest | Admin changes only affect future workflows |
| Versioned pricing table | Strong audit model | Bigger scope than MVP needs |

- **D-05:** Snapshot fees and profit onto `workflow_steps` when a workflow is created.
  - Old client files keep the exact fee/profit they started with.
  - Changes in `workflow_step_configs` affect future workflows only.
  - Reason: government fees and office prices can change, but old receipts should not magically rewrite themselves.

- **D-06:** Keep `workflow_step_configs` as the default price list, not the ledger.
  - `workflow_step_configs` answers: "What should a new step cost?"
  - `workflow_steps` answers: "What did this client file cost?"
  - Financial events answer: "What money actually moved?"

### Profit Tracking

**Tradeoff analysis:**

| Approach | Pros | Cons |
|----------|------|------|
| Count planned profit immediately | Shows expected earnings | Can overstate real cash |
| Count profit only after payment | Safer cash view | Needs allocation rule when partial payments happen |
| Show both planned and realized profit | Most useful for managers | Slightly more dashboard wording |

- **D-07:** Track planned profit and realized profit separately.
  - Planned profit = sum of workflow step `profit`.
  - Realized profit = profit portion of payments actually received.
  - Simple meaning: "what we expect to earn" and "what we already got" are two different boxes.

- **D-08:** Use proportional allocation for partial payments unless a payment is tied to a specific step.
  - If payment is step-specific, allocate against that step first.
  - If payment is workflow-level, split between government fee and office profit based on the workflow's fee/profit ratio.
  - Reason: keeps math predictable without forcing employees to micromanage every pound.

### Dashboard Money Cards

**Tradeoff analysis:**

| Approach | Pros | Cons |
|----------|------|------|
| Only collected fees | Simple | Misses profit and debt |
| Only debt | Focuses on follow-up | Misses business performance |
| Fees, profit, and debt together | Complete money picture | Needs clear labels |

- **D-09:** Dashboard financial widgets should show all three key numbers:
  - Total fees collected
  - Realized office profit
  - Total outstanding debt

- **D-10:** Dashboard should use existing `KpiCard` / `KpiGrid` patterns.
  - Reason: keeps UI consistent with Phase 1 dashboard components.
  - Labels must be Arabic-friendly and currency-formatted in EGP.

### Data Safety And Permissions

- **D-11:** Add dedicated financial tables with RLS policies using `TO authenticated`.
  - This follows the project rule: every Supabase policy must explicitly target authenticated users.
  - Admin/manager can view and manage financial records.
  - Employee access should follow workflow assignment rules where possible.

- **D-12:** Prefer database constraints for money validity.
  - Amounts must not be negative except explicit refund/adjustment events.
  - Currency defaults to `EGP`.
  - Payment events should require workflow ownership and valid references.

### the agent's Discretion

- Exact table names and column names, as long as they clearly separate price config, workflow step snapshots, and financial events.
- Exact Arabic labels for dashboard cards, as long as they are clear and consistent with existing UI.
- Whether to create a small helper service for financial calculations or keep it inside a repository/service pair, as long as it follows the project layering pattern.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Scope And Requirements

- `.planning/ROADMAP.md` - Phase 3 goal, plans, and success criteria.
- `.planning/REQUIREMENTS.md` - FIN-01 through FIN-05 requirements.
- `.planning/PROJECT.md` - Arabic RTL, serverless-first, no Excel, ERP domain context.

### Prior Phase Decisions

- `.planning/phases/01-core-foundation/01-CONTEXT.md` - Supabase, auth, RLS, Next.js, dashboard UI foundations.
- `.planning/phases/02-workflow-engine/02-CONTEXT.md` - Workflow state machine, `workflow_step_configs`, fees/profit per step, dependency behavior.

### Existing Code

- `src/types/database.types.ts` - Current workflow, step, and config types.
- `src/lib/services/workflow.service.ts` - Existing workflow business logic and dependency checks.
- `src/lib/database/repositories/workflow.repository.ts` - Workflow repository pattern.
- `src/lib/database/repositories/workflow-step.repository.ts` - Workflow step repository and config lookup.
- `src/components/dashboard/KpiCard.tsx` - Reusable dashboard card component.
- `src/components/dashboard/KpiGrid.tsx` - Reusable dashboard KPI grid component.
- `supabase/schema.sql` - Base database schema and RLS style.
- `supabase/migrations/003_create_workflow_step_configs.sql` - Step financial config table and authenticated RLS examples.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- `KpiCard` and `KpiGrid`: ready for financial dashboard cards.
- `WorkflowService`: place to coordinate workflow-level financial calculations.
- Repository pattern in `src/lib/database/repositories`: use the same style for financial repositories.
- `WorkflowStep.fees` and `WorkflowStep.profit`: already snapshot per workflow step.
- `workflow_step_configs`: existing default price list for new workflow steps.

### Established Patterns

- Service layer handles business rules.
- Repository layer talks to Supabase.
- Types live in `src/types/database.types.ts`.
- Supabase RLS policies must include `TO authenticated`.
- UI is Arabic RTL through the root layout, not per component.

### Integration Points

- Add financial tables through Supabase migration files.
- Add financial types to `database.types.ts`.
- Add `financial.repository.ts` and `financial.service.ts` or equivalent.
- Connect financial totals to client profile/workflow pages.
- Connect dashboard cards to financial aggregate queries.

</code_context>

<specifics>
## Specific Ideas

- Treat payments like receipt rows: never delete the story of what happened.
- Keep old workflow prices stable even if the admin changes the default price list later.
- Show both expected profit and collected profit where useful, but Phase 3 dashboard must at least show realized profit.
- Use EGP as the default currency.

</specifics>

<deferred>
## Deferred Ideas

### Future Phase

- Cached financial summary table if dashboard queries become slow.
- Full accounting/general ledger remains out of scope per `.planning/REQUIREMENTS.md`.
- VAT and invoice compliance are v2 financial requirements, not Phase 3 MVP.

</deferred>

---

*Phase: 03-financial-layer*
*Context gathered: 2026-04-28*
