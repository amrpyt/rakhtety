---
status: complete
completed: "2026-04-30"
quick_id: "260430-4ng"
slug: "simplify-client-detail-ux-to-focus-emplo"
---

# Summary: Simplify Client Detail UX

## Completed

- Added `المطلوب الآن` so the employee sees the next task first.
- Collapsed long instructions behind `عرض التعليمات`.
- Collapsed basic document gallery behind `عرض المستندات`.
- Changed workflow timeline into a focused checklist:
  - only the current step is expanded
  - future steps stay compact
  - upload controls are hidden until the step is started
- Fixed tabs so inactive workflow panels are not rendered on the page.
- Collapsed finance behind `عرض المالية`.
- Preserved backend/API behavior.

## Verification

- `pnpm test` passed.
- `pnpm typecheck` passed.
- `pnpm lint` passed with warnings only.
- Browser-use verified:
  - `المطلوب الآن`
  - `عرض التعليمات`
  - `عرض المستندات`
  - only device workflow content is visible by default
  - `عرض المالية`

## Files Changed

- `src/app/(dashboard)/clients/[id]/page.tsx`
- `src/components/ui/Tabs.tsx`
- `src/components/workflow/WorkflowTimeline.tsx`
- `src/components/workflow/WorkflowStep.tsx`
