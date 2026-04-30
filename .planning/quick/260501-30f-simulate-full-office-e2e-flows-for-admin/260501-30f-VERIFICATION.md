# Quick Verification: Office E2E Simulation

## Browser Use Checks

| Flow | Result | Notes |
|---|---:|---|
| Admin login | PASS | Fresh admin account reached `/dashboard`. |
| Admin navigation | PASS | Employees nav was visible. |
| Client creation | PASS | Created client with required intake documents. |
| Device License dependency | PASS | Excavation was locked before Device License completed. |
| Employee login | PASS | Fresh employee account reached `/dashboard`. |
| Employee restrictions | PASS | Employees nav hidden; `/employees` did not expose employee management. |
| Employee workflow work | PASS | Employee started/completed Device License steps and uploaded documents. |
| Employee payment | PASS | Employee recorded `250` payment and financial totals updated. |
| Report access | PASS | Report showed client data, workflows, paid amount, and debt. |
| Excavation unlock | PASS | Excavation unlocked only after Device License was complete. |
| Admin Excavation workflow | PASS | Admin created and completed all 13 Excavation steps. |

## Code/Data Checks Added

- Added UI affordance to create Excavation Permit after dependency unlock.
- Added RLS migration for employee workflow document read/insert access.
- Added migration to deactivate the legacy `meter_application` requirement for the construction-meter step.

## Remaining Risk

- Browser Use file inputs did not reliably trigger the React Hook Form upload state, so the run used browser-context API uploads with valid PDF files. A manual QA pass should still try dragging/selecting files through the visible upload control.
