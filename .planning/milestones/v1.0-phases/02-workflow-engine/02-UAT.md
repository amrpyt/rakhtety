---
status: testing
phase: 02-workflow-engine
source: 02-01-SUMMARY.md, 02-02-SUMMARY.md, 02-03-SUMMARY.md, 02-04-SUMMARY.md
started: 2026-04-29
updated: 2026-04-29
---

## Current Test

number: 2
name: Workflow State Transitions — Valid
expected: |
  Start a client workflow. Click Start on a step — it moves to in_progress. Click Complete — it moves to completed with timestamp.
awaiting: user response

## Tests

### 1. Cold Start Smoke Test
expected: |
  Kill any running server. Clear caches. Start Next.js app with `pnpm dev`. Server boots without errors and workflow UI loads.
result: pass

### 2. Workflow State Transitions — Valid
expected: |
  Start a client workflow. Click Start on a step — it moves to in_progress. Click Complete — it moves to completed with timestamp.
result: pending

### 3. Workflow State Transitions — Invalid Blocked
expected: |
  Try to move a step backwards (COMPLETED → PENDING). App should reject with error, not crash.
result: pending

### 4. Excavation Permit Blocked Until Device License Complete
expected: |
  Create a new client. On the Excavation Permit tab, the first step should be visible but grayed out with a lock icon and tooltip explaining it waits for Device License.
result: pending

### 5. Excavation Permit Unlocks After Device License
expected: |
  Complete all Device License steps. Then go to Excavation Permit tab — the blocked steps should now be clickable/startable.
result: pending

### 6. Financial Info Per Step
expected: |
  In the workflow step UI, each step shows government fee and office profit values (e.g., "رسم حكومي: 500 ج.م" / "ربح المكتب: 150 ج.م").
result: pending

### 7. Step Status Display
expected: |
  Each step shows its status (pending / in_progress / completed) with the assigned employee name and completion date when done.
result: pending

## Summary

total: 7
passed: 0
issues: 0
pending: 7
skipped: 0
blocked: 0

## Gaps

[none yet]
