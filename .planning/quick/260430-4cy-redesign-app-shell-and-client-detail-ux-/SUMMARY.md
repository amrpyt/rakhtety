---
status: complete
completed: "2026-04-30"
quick_id: "260430-4cy"
slug: "redesign-app-shell-and-client-detail-ux-"
---

# Summary: Redesign App Shell And Client Detail UX

## Completed

- Created UI-SPEC for a premium Arabic operations-dashboard direction.
- Reworked global visual tokens toward warmer paper surfaces, deeper contrast, larger radii, and stronger shadows.
- Redesigned the desktop sidebar into a dark operations rail with clearer active states.
- Improved mobile nav contrast.
- Rebuilt the client detail top area into a hero with identity, metadata, and workflow status.
- Redesigned the guidance card into compact operational steps.
- Redesigned basic client documents as a gallery with stronger cards and clear preview/download actions.

## Verification

- `pnpm test` passed.
- `pnpm typecheck` passed.
- `pnpm lint` passed with warnings only.
- Browser-use verified the active client page shows:
  - `حالة الملف الآن`
  - `دليل التشغيل السريع`
  - `معرض مستندات العميل الأساسية`

## Follow-Up

- Apply the same visual system to `/clients`, `/dashboard`, `/workflows`, `/finance`, and `/employees`.
- Consider replacing preview `<img>` tags with `next/image` later if the app keeps image previews long term.
