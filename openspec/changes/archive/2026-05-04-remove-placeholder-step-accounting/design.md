## Context

The client workflow page has two data sources for steps:

- Real steps returned from Frappe workflow APIs.
- Placeholder steps generated from frontend templates when a workflow is missing steps.

The placeholders are useful for explaining the process, but their fees/profit values are not authoritative for a specific client. Showing those numbers makes template data look like live accounting data.

## Goals / Non-Goals

**Goals:**
- Make the workflow UI truthful about financial data.
- Hide placeholder fees/profit while preserving real step fees/profit.
- Keep accounting inputs attached to real in-progress document upload.
- Identify other static UI/data fallbacks that may need follow-up decisions.

**Non-Goals:**
- Do not rebuild the workflow engine.
- Do not change Frappe database schema.
- Do not create missing Frappe excavation steps in this change.
- Do not delete template step names; they still help explain unopened or incomplete workflows.

## Decisions

- Placeholder steps will keep names/status only and set `fees`/`profit` to `undefined`.
  - Rationale: `WorkflowStep` already hides money chips when the values are undefined.
  - Alternative: hide money based on `id.startsWith('placeholder-')` inside `WorkflowStep`; rejected because the caller knows which data is placeholder.

- Real steps will continue to pass backend `fees`/`profit`.
  - Rationale: backend rows are the source of truth for client-specific accounting snapshots.

- Static-data audit will be reported separately instead of auto-changing every finding.
  - Rationale: some static copy is legitimate guidance; only misleading operational data should be removed immediately.

## Risks / Trade-offs

- Placeholder workflow pages will show less financial context until real steps exist. -> This is acceptable because fake precision is worse than missing context.
- Some static values may be intentional design examples. -> Report them for product review before changing broad behavior.
