---
phase: 02
plan: 04
subsystem: workflow-step-completion
tags:
  - workflow
  - completion
  - financial-display
key-files:
  modified:
    - src/lib/services/workflow.service.ts
    - src/hooks/useWorkflows.ts
    - src/components/workflow/WorkflowStep.tsx
    - src/components/workflow/WorkflowTimeline.tsx
    - src/components/workflow/WorkflowTabs.tsx
    - src/app/(dashboard)/clients/[id]/page.tsx
requirements-completed:
  - WF-04
  - WF-05
completed: 2026-04-29
---

# Phase 2 Plan 04: Step Completion with Financial Config Summary

Added start and complete actions for workflow steps and surfaced per-step fees and office profit in the workflow UI.

## Completed Tasks

| Task | Result |
|------|--------|
| Start action | Pending steps can move to `in_progress` |
| Complete action | In-progress steps can move to `completed` with `completed_at` set |
| Parent sync | Workflow status becomes `in_progress` after work starts and `completed` when all steps are completed |
| Financial display | Workflow steps show government fees and office profit |

## Verification

- `pnpm test -- src/lib/database/repositories/workflow-step.repository.test.ts` passed.
- `pnpm run typecheck` passed.
- `pnpm run build` passed.

## Deviations from Plan

- Completion callbacks are wrapper functions from the client page: start passes `in_progress`, complete passes `completed`.
- Financial defaults are copied from `workflow_step_configs` into `workflow_steps` when steps are created, so the existing UI can display fees without an extra join.

## Self-Check: PASSED
