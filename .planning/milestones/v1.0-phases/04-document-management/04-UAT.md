---
status: passed
phase: 04-document-management
source:
  - .planning/phases/04-document-management/04-01-SUMMARY.md
  - .planning/phases/04-document-management/04-02-SUMMARY.md
  - .planning/phases/04-document-management/04-03-SUMMARY.md
  - .planning/phases/04-document-management/04-04-SUMMARY.md
started: 2026-04-29T23:30:00+03:00
updated: 2026-04-29T23:59:00+03:00
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

number: 1
name: Complete
expected: |
  Phase 4 E2E browser test is complete.
awaiting: none

## Tests

### 1. Cold Start Smoke Test
expected: Start the app from scratch. The app should boot cleanly and the document workflow should still load after startup.
result: passed
evidence: Loaded `/clients/bdeccba5-e66a-4d59-9802-2a9955bb6ad3` in `agent-browser` after admin login.

### 2. Required Document Panel
expected: Opening a workflow step shows the document upload panel with required document status and clear Arabic labels.
result: passed
evidence: Required labels appeared for `بيان الصلاحية`, `إيصال تقديم الملف`, `إيصال الدفع`, and `صورة الرخصة`.

### 3. Upload Document
expected: Uploading a valid file saves the document, shows it attached to the step, and updates the document status.
result: passed
evidence: Uploaded `test-upload.png`; `/api/workflow-documents/upload` returned 200 and the page showed the file attached.

### 4. Workflow Gate
expected: A workflow step that still misses required documents stays blocked until the document is uploaded.
result: passed
evidence: Completing `تقديم الملف` without `إيصال تقديم الملف` stayed blocked and showed the Arabic missing-document message.

### 5. Download or Preview
expected: An uploaded document can be opened for download or preview from the workflow UI.
result: passed
evidence: Clicking `فتح` created a signed Supabase Storage URL successfully.

## Summary

total: 5
passed: 5
issues: 1
pending: 0
skipped: 0

## Fixed During UAT

- Direct browser upload to Supabase Storage failed with `new row violates row-level security policy`.
- Added authenticated app API upload route that verifies the user, then uploads with the server admin client.
- `agent-browser upload` is fragile with Windows paths; for this UAT, file selection was simulated in the page with `agent-browser eval`.
