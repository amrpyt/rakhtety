---
status: planned
created: "2026-04-30"
quick_id: "260430-47k"
slug: "add-gallery-style-preview-and-download-a"
---

# Quick Task: Client Intake Document Gallery

## Goal

Add gallery-style preview and download actions for the basic client documents shown on the client detail page.

## Why

Managers and employees can currently see the names of the intake documents uploaded during client creation, but they need to open or download those files directly from the client profile.

## Scope

- Add secure API routes for client intake document preview/download signed URLs.
- Add preview and download buttons to each item in `مستندات العميل الأساسية`.
- Reuse the current modal preview behavior used by workflow documents.
- Verify through browser-use on the real client page.

## Out Of Scope

- Re-uploading or deleting intake documents.
- Changing workflow step document behavior.
- Changing database schema.

## Checks

- `pnpm test`
- `pnpm typecheck`
- `pnpm lint`
- Browser-use verification
