## Why

Employees are part of the daily office workflow, but the current app blocks them from adding new clients. Step work also splits document upload from the accounting numbers for the same step, and the dashboard shell shows the generic role label instead of the employee's assigned job title.

This creates extra clicks and confusing identity text for the exact people using the system during execution.

## What Changes

- Allow employees to create client files from the Clients page and `POST /api/clients`.
- Keep step accounting beside the step document upload by adding amount fields to the step document panel.
- Persist uploaded document accounting values into the workflow step's fee/profit fields so summaries keep using the existing step totals.
- Return the current user's employee position/job title from Frappe when available.
- Show the user's job title in the dashboard sidebar, falling back to the Arabic role label only when no title exists.

## Capabilities

### New Capabilities
- `office-workflow-operations`: Covers employee client creation, step document accounting entry, and job-title display in the office workflow UI.

### Modified Capabilities
- None.

## Impact

- Frontend permissions and Clients page add-client visibility.
- `POST /api/clients` authorization.
- Step document upload UI, validation schema, document service payload, and upload API.
- Frappe app API/services for current user metadata and workflow-step accounting updates.
- Auth user/session type shape and dashboard sidebar display.
- Tests for permissions and request parsing where behavior changes.
