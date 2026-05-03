---
phase: 02
plan: 01
subsystem: workflow-database
tags:
  - workflow
  - supabase
  - rls
key-files:
  created:
    - supabase/migrations/002_add_workflow_step_state.sql
    - supabase/migrations/003_create_workflow_step_configs.sql
  modified:
    - src/types/database.types.ts
requirements-completed:
  - WF-01
  - WF-02
  - WF-04
  - WF-05
completed: 2026-04-29
---

# Phase 2 Plan 01: Database Schema for Workflows Summary

Implemented database-level workflow step transition enforcement and per-step financial configuration.

## Completed Tasks

| Task | Result |
|------|--------|
| State transition trigger | Added `enforce_workflow_step_transition()` and `trg_enforce_workflow_step_transition` using `BEFORE UPDATE OF status` |
| Financial config table | Added `workflow_step_configs` with default government fees and office profit for all 10 workflow steps |
| Security rules | Enabled RLS and added `TO authenticated` policies for select/insert/update/delete |

## Verification

- `pnpm run typecheck` passed.
- `pnpm run build` passed.
- Supabase MCP migrations applied: `add_workflow_step_state`, `create_workflow_step_configs`, and `harden_workflow_functions_search_path`.
- Migration text checks passed for trigger function, trigger, RLS, and policy clauses.

## Deviations from Plan

- Used `uuid_generate_v4()` instead of `gen_random_uuid()` to match the existing project schema extension.
- Default currency is `EGP`, matching the Egyptian permit domain and existing UI labels.
- Added a local `004_harden_workflow_functions_search_path.sql` migration after Supabase advisor flagged mutable function search paths.

## Self-Check: PASSED
