---
phase: 02
plan: 03
subsystem: workflow-dependency-gate
tags:
  - workflow
  - dependency
  - ui
key-files:
  modified:
    - src/lib/services/workflow.service.ts
    - src/hooks/useWorkflows.ts
    - src/components/workflow/WorkflowStep.tsx
    - src/components/workflow/WorkflowTimeline.tsx
    - src/components/workflow/WorkflowTabs.tsx
    - src/app/(dashboard)/clients/[id]/page.tsx
requirements-completed:
  - WF-03
completed: 2026-04-29
---

# Phase 2 Plan 03: Workflow Dependency Gate Summary

Implemented the Excavation Permit dependency gate so it remains locked until Device License is completed.

## Completed Tasks

| Task | Result |
|------|--------|
| Service gate | Added `WorkflowDependencyStatus` and detailed `checkDependency()` result |
| Hook state | Added `excavationPermitBlocked` and `excavationPermitBlockedReason` without changing the `useWorkflows(clientId)` API |
| UI lock | Kept the excavation path visible, locked, and explained with a lock message |

## Verification

- `pnpm run typecheck` passed.
- `pnpm run build` passed.

## Deviations from Plan

- Did not create a parallel `WorkflowStepCard` implementation. Extended the existing `WorkflowStep` and `WorkflowTimeline` components instead, which keeps the UI consistent with the current project.
- Kept RTL at the app/global level instead of adding `dir="rtl"` to the component, matching project instructions.

## Self-Check: PASSED
