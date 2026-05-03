## Context

The Next.js frontend currently gates client creation through `manageClients`, and employees have that permission set to false. The API route uses the same permission for `POST /api/clients`.

Workflow steps already carry accounting values as `fees` and `profit`, mapped from Frappe `government_fees` and `office_profit`. The current document upload panel only sends file metadata, so the user must mentally connect the uploaded document to the financial numbers elsewhere.

The dashboard sidebar displays `roleLabels[user.role]`. Frappe `current_user` returns role and name, but not the linked employee position/title.

## Goals / Non-Goals

**Goals:**
- Let employees create clients through existing UI and API flows.
- Add step accounting fields to the existing document upload panel without introducing a separate accounting screen.
- Save the submitted accounting values into the existing workflow-step fee/profit fields.
- Add a `position` field to the auth user payload and display it in the sidebar when available.

**Non-Goals:**
- Build a new finance ledger or payment collection system.
- Rework employee management during the Frappe migration.
- Change workflow dependency rules between Device License and Excavation Permit.
- Replace the current Frappe adapter pattern.

## Decisions

1. Use the existing `manageClients` action for client creation and grant it to employees.

   Rationale: the UI and API already use this action for the add-client flow. Adding a second action would be more precise but wider, and the requested behavior is exactly "employees can add clients".

   Alternative considered: create `createClients` separate from `manageClients`. This is cleaner long-term but requires more route and UI distinction than this fix needs.

2. Store upload-time accounting values on the workflow step, not on the document.

   Rationale: both the TypeScript model and Frappe DocType already store `government_fees` and `office_profit` on steps, and financial summaries already read step totals.

   Alternative considered: create per-document accounting records. That would support multiple costs per step, but this repo does not currently have a document-accounting DocType or API.

3. Extend the Frappe `current_user` response with `position`.

   Rationale: the sidebar already has the current auth user in context, so showing the job title needs no extra client fetch.

   Alternative considered: load employees on every dashboard shell render. This would be slower and is blocked for normal employees by the employee-management route gate.

## Risks / Trade-offs

- Employees gaining `manageClients` also exposes any UI tied to that action, such as edit-client buttons. Mitigation: keep this change scoped and review client edit routes before enabling actual update/delete behavior for employees.
- Saving accounting values on the step means the latest upload form values overwrite the step totals. Mitigation: label the fields as step totals and keep them optional/defaulted from the current step values.
- Frappe currently stores the employee display field as `role_label`, not a separate job-title field. Mitigation: use the linked employee field available now, and treat a future dedicated position field as a drop-in source.

## Migration Plan

1. Update frontend permissions, types, schemas, document upload UI, and sidebar display.
2. Update Next API payloads and Frappe service methods to carry and save step accounting numbers.
3. Update Frappe employee/current-user mapping to return position/title when available.
4. Run automated checks, then verify the employee flow in Browser Use.
