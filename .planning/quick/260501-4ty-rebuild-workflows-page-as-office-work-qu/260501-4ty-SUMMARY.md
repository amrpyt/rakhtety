# Quick Summary: Rebuild Workflows Page As Office Work Queue

## Result

`/workflows` is no longer a placeholder. It now shows a live office queue with workflow rows, filters, summary totals, and open-client actions.

## Changes

- Added `/api/workflows/overview` as a read-only queue data source.
- Added `WorkflowOverviewItem` for the queue row shape.
- Rebuilt `/workflows` with:
  - active workflow count
  - stuck workflow count
  - workflow debt total
  - filters for all, active, stuck, completed, Device License, and Excavation Permit
  - rows showing client, workflow type, current step, employee, last update, debt, and open file action

## Browser Use Verification

- Admin opened `/workflows`, saw real workflow rows, used filters, and opened a client file.
- Employee opened `/workflows`, saw no Employees nav, used active filter, and opened an allowed client file.

## Checks

- `pnpm test`
- `pnpm lint`
- `pnpm typecheck`
