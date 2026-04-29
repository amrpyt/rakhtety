# Phase 3: Financial Layer - Research

**Phase:** 03-financial-layer
**Date:** 2026-04-28
**Status:** Research complete

## Research Summary

Phase 3 should use an append-only financial event model. Simple meaning: every payment, refund, or adjustment is saved as a row, like a receipt. We do not erase the story of what happened.

This fits the existing app because:

- `workflow_steps` already stores snapshot amounts in `fees` and `profit`.
- `workflow_step_configs` already acts like the default price list.
- The app already uses a service/repository pattern.
- Supabase/Postgres can enforce financial safety with constraints and RLS.

## Recommended Architecture

### Data Model

Create `financial_events` table.

Core fields:

- `id`
- `workflow_id`
- `workflow_step_id` nullable
- `client_id`
- `type`: `payment`, `refund`, `adjustment`
- `amount`
- `currency`
- `payment_method`
- `reference_number`
- `notes`
- `created_by`
- `created_at`

Why this shape:

- Workflow-level payment works for lump sums.
- Optional step link works for exact step payments.
- Event type supports refunds and corrections without editing history.

### Calculation Rules

Use live calculation first.

Formulas:

- `total_cost = sum(workflow_steps.fees + workflow_steps.profit)`
- `total_paid = sum(payment events) - sum(refund events) +/- adjustments`
- `outstanding_debt = total_cost - total_paid`
- `planned_profit = sum(workflow_steps.profit)`
- `realized_profit = profit portion of payments received`

For workflow-level partial payments:

- Use proportional allocation between fees and profit.
- Example: if workflow is 75% fees and 25% profit, then a 1000 EGP payment counts as 750 EGP fees and 250 EGP realized profit.

### Security

Financial records are sensitive.

RLS rules must include `TO authenticated`.

Access model:

- Admin/manager can view and create financial events.
- Employees can view events only for workflows assigned to them.
- Deletion should be blocked or admin-only. Prefer no deletion for MVP.

### UI

Add payment recording from the client/workflow area.

Use existing UI pieces:

- `Card`
- `Button`
- `Form`
- `Table`
- `KpiCard`
- `KpiGrid`

Keep Arabic RTL from root layout. Do not add `dir="rtl"` per component.

## Risks

- Money math can drift if totals are stored in many places. Use live calculations first.
- Old prices can change accidentally if calculation reads `workflow_step_configs`. Always calculate from `workflow_steps` snapshots.
- Refunds can make negative balances if validation is loose. Add database constraints and service validation.

## Validation Architecture

Test the math with unit tests:

- full payment
- partial payment
- overpayment handling
- refund
- workflow-level proportional allocation
- step-specific payment allocation

Test database migration by checking:

- table exists
- RLS enabled
- policies include `TO authenticated`
- amount constraints exist

## RESEARCH COMPLETE
