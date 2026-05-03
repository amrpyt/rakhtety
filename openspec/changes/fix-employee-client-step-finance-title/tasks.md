## 1. Employee Client Creation

- [x] 1.1 Grant employees client creation permission in the shared permission matrix and keep route visibility consistent.
- [x] 1.2 Update the client creation API gate so authenticated employees can submit valid new-client requests.
- [x] 1.3 Update permission tests to prove employees can create clients while still blocking employee-management/admin-only actions.

## 2. Step Document Accounting

- [x] 2.1 Extend document upload validation/types/service payloads with optional non-negative step accounting values.
- [x] 2.2 Add accounting inputs to the workflow-step document upload panel beside the file upload controls.
- [x] 2.3 Send accounting values through `POST /api/workflow-documents/upload` into the Frappe adapter.
- [x] 2.4 Persist submitted accounting values into the Frappe workflow step's government fee and office profit fields.

## 3. Job Title Display

- [x] 3.1 Extend the auth user type/session payload with an optional `position` field.
- [x] 3.2 Return the linked employee position/title from Frappe `current_user` when available.
- [x] 3.3 Show the user's position/title in the dashboard sidebar before falling back to the role label.

## 4. Verification

- [x] 4.1 Run OpenSpec validation for this change.
- [x] 4.2 Run automated project checks required for this edit round.
- [ ] 4.3 Verify the employee flow in Browser Use.
