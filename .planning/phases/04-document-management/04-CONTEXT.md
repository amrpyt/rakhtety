# Phase 4: Document Management - Context

**Gathered:** 2026-04-28
**Status:** Ready for planning
**Mode:** Autonomous defaults

<domain>
## Phase Boundary

Implement workflow-step document upload, document metadata storage, required document validation, and optional document support.

This phase makes each workflow step able to hold its own files. The app must block step completion when required documents are missing, while optional documents should not block progress.

</domain>

<decisions>
## Implementation Decisions

### Storage Model
- **D-01:** Use Supabase Storage bucket `workflow-documents` for binary files.
- **D-02:** Store metadata in `workflow_documents`, linked to workflow and workflow step.
- **D-03:** Keep document requirements in `workflow_document_requirements` so required/optional rules are configurable.

### Completion Gate
- **D-04:** `WorkflowService.updateStepStatus(..., 'completed')` must call document validation first.
- **D-05:** Missing required docs block completion with a clear Arabic error.
- **D-06:** Optional documents appear in the UI but do not block completion.

### UI Behavior
- **D-07:** Show document upload panel inside each real workflow step.
- **D-08:** Reuse existing Card/Button/Form styling and keep RTL inherited from root layout.

### Security
- **D-09:** Database and storage policies use `TO authenticated`.
- **D-10:** Admin/manager and assigned employees can access workflow documents.

### the agent's Discretion
- Exact seeded requirement list can be adjusted later by admin/manager.
- Exact document labels can be refined after real office feedback.

</decisions>

<canonical_refs>
## Canonical References

- `.planning/ROADMAP.md` - Phase 4 scope and success criteria.
- `.planning/REQUIREMENTS.md` - DOC-01 through DOC-04.
- `.planning/phases/03-financial-layer/03-CONTEXT.md` - Prior phase patterns for service/repository/UI layering.
- `src/lib/services/workflow.service.ts` - Completion flow integration point.
- `src/components/workflow/WorkflowStep.tsx` - Step UI integration point.
- `supabase/migrations/006_create_workflow_documents.sql` - Document schema and storage policies.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `WorkflowStep` renders each step and action buttons.
- `WorkflowService.updateStepStatus` controls completion.
- UI primitives exist in `src/components/ui`.

### Established Patterns
- Repositories talk to Supabase.
- Services enforce business rules.
- Hooks bridge services to React components.

### Integration Points
- Supabase migration for document tables and bucket.
- `document.service.ts` validation before workflow completion.
- `DocumentUploadPanel` inside each workflow step.

</code_context>

<specifics>
## Specific Ideas

Documents are treated like step evidence: each step can show what has already been uploaded and what is missing.

</specifics>

<deferred>
## Deferred Ideas

- Arabic OCR and document expiration alerts remain v2.
- PDF report embedding uploaded documents belongs to reporting polish later.

</deferred>

---

*Phase: 04-document-management*
*Context gathered: 2026-04-28*
