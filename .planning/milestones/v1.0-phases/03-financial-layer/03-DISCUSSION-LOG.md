# Phase 3: Financial Layer - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-04-28
**Phase:** 03-financial-layer
**Areas discussed:** Payment Shape, Debt Rules, Fee Changes, Profit Tracking, Dashboard Money Cards, Data Safety And Permissions
**Mode:** `--auto --analyze`

---

## Payment Shape

| Option | Description | Selected |
|--------|-------------|----------|
| One payment per workflow | Simple receipt entry, but weak step-level detail | |
| One payment per step | Clear matching, but too strict for lump-sum payments | |
| Flexible payment records | Workflow-level payments with optional step allocation | Yes |

**Auto choice:** Flexible payment records with optional allocation.
**Notes:** Best fit for real office behavior because clients may pay all at once, in pieces, or for one specific government step.

---

## Debt Rules

| Option | Description | Selected |
|--------|-------------|----------|
| Live calculation | Re-add bill and receipts from source records | Yes |
| Stored totals only | Fast, but easy to corrupt if one update fails | |
| Events plus cached summaries | Good later, but too much for first pass | |

**Auto choice:** Calculate debt from financial events and step fee/profit snapshots.
**Notes:** Keeps one source of truth. Cached summaries are deferred until real performance pressure appears.

---

## Fee Changes

| Option | Description | Selected |
|--------|-------------|----------|
| Always use latest config | Simple, but rewrites old client file totals | |
| Snapshot fees on workflow steps | Old client files keep their original prices | Yes |
| Versioned pricing table | Strong audit model, but more complex than MVP needs | |

**Auto choice:** Snapshot fees/profit onto workflow steps at workflow creation.
**Notes:** This matches existing Phase 2 implementation direction where `workflow_steps` already store `fees` and `profit`.

---

## Profit Tracking

| Option | Description | Selected |
|--------|-------------|----------|
| Planned profit only | Shows expected earnings, but can overstate cash | |
| Realized profit only | Safer cash view, but hides expected earnings | |
| Planned and realized profit | Shows expected and actually collected profit separately | Yes |

**Auto choice:** Track planned and realized profit separately.
**Notes:** This is the clearest manager view. Planned profit is the target; realized profit is the money actually collected.

---

## Dashboard Money Cards

| Option | Description | Selected |
|--------|-------------|----------|
| Fees only | Simple, incomplete | |
| Debt only | Good for follow-up, incomplete | |
| Fees, profit, and debt | Complete Phase 3 money picture | Yes |

**Auto choice:** Show total fees collected, realized office profit, and outstanding debt.
**Notes:** Use existing `KpiCard` and `KpiGrid` components for consistency.

---

## Data Safety And Permissions

| Option | Description | Selected |
|--------|-------------|----------|
| App-only validation | Easier, but weaker for financial data | |
| Database constraints plus RLS | Stronger safety and follows project rules | Yes |
| Edge-function-only financial logic | Centralized, but not needed for this MVP | |

**Auto choice:** Use database constraints and RLS with `TO authenticated`.
**Notes:** Money records need stronger guardrails than normal UI fields.

---

## the agent's Discretion

- Exact table and type names.
- Exact Arabic dashboard labels.
- Exact service/repository file split.

## Deferred Ideas

- Cached summary table if live dashboard aggregation becomes slow.
- Full accounting/general ledger.
- VAT and invoicing compliance.
