---
status: resolved
trigger: "After adding a client with files, the client detail workflow still asks employees to upload files again, which makes the UX feel duplicated and confusing."
created: "2026-04-30"
updated: "2026-04-30"
---

# Debug Session: duplicate-client-file-upload

## Symptoms

- Expected behavior: After creating a client and uploading the basic client documents, employees should understand those files are already saved and should not upload them again.
- Actual behavior: The client workflow step upload panel appears after creation, so employees can think they must upload the same files again.
- Error messages: No runtime error. This is a UX and workflow clarity bug.
- Timeline: Found after testing the add-client and client-detail flow.
- Reproduction:
  1. Add a client.
  2. Upload the required intake documents during client creation.
  3. Open the created client page.
  4. See workflow steps with document upload areas.
  5. The UI does not clearly separate intake documents from step documents.

## Current Focus

- hypothesis: Intake documents and workflow step documents are separate data buckets, but the UI copy and client detail page do not explain or show that separation clearly enough.
- test: Inspect the client detail API and UI to confirm whether intake documents are fetched and displayed, then verify the workflow upload panel explains it only accepts step-specific documents.
- expecting: Client detail page should show saved intake files, and workflow upload text should say not to re-upload basic client documents.
- next_action: Gather code evidence and browser evidence.
- reasoning_checkpoint:
- tdd_checkpoint: TDD mode is enabled; add or run regression checks before committing any code change.

## Evidence

- timestamp: 2026-04-30
  source: code
  finding: `src/app/api/clients/[id]/route.ts` fetches `intake_documents:client_intake_documents(*)`, so the client detail API can show intake files saved during client creation.
- timestamp: 2026-04-30
  source: code
  finding: `src/app/(dashboard)/clients/[id]/page.tsx` renders `ClientIntakeDocumentsCard`, titled `مستندات العميل الأساسية`, explaining these are the files uploaded while adding the client.
- timestamp: 2026-04-30
  source: code
  finding: `src/components/documents/DocumentUploadPanel.tsx` tells employees to upload only the current step document and not re-upload basic client files.
- timestamp: 2026-04-30
  source: browser-use
  finding: Browser found `مستندات العميل الأساسية`, `هذه هي الملفات التي تم رفعها وقت إضافة العميل`, and `لا تعيد رفع مستندات العميل الأساسية` on the real client page.

## Eliminated

## Resolution

- root_cause:
  The app had two valid document buckets, but the UX did not explain them clearly enough: intake documents belong to the client folder, while workflow documents belong to specific workflow steps.
- fix:
  Show saved intake documents on the client detail page and rewrite workflow upload guidance so employees know not to upload the same basic files again.
- verification:
  Browser-use verified the intake card and anti-duplicate-upload guidance on `http://localhost:3000/clients/f5b2634f-ec76-4f53-8213-7bd7de77383c`.
- files_changed:
  - src/app/(dashboard)/clients/[id]/page.tsx
  - src/app/api/clients/[id]/route.ts
  - src/components/documents/DocumentUploadPanel.tsx
  - src/types/database.types.ts
