# Quick Verification: Workflows Office Queue

## Acceptance

| Check | Result |
|---|---:|
| Placeholder replaced with live queue | PASS |
| Rows include client, workflow, current step, employee, last update, debt, open action | PASS |
| Filters include all, active, stuck, completed, Device License, Excavation Permit | PASS |
| Admin can see queue and open a client file | PASS |
| Employee can see queue without employee-management controls | PASS |
| Empty state exists for no workflows or no filtered results | PASS |

## Notes

- The page is read-only by design.
- Step execution, document upload, payment recording, and reports remain inside `/clients/[id]`.
