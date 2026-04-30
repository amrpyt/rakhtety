---
status: planned
created: "2026-04-30"
quick_id: "260430-4i4"
slug: "finish-client-detail-redesign-for-workfl"
---

# Plan: Finish Client Detail Redesign

## Goal

Finish the active client detail page redesign by improving the workflow and finance sections without changing backend behavior.

## Constraints

- Do not change API contracts.
- Do not change workflow dependency rules.
- Keep UX simpler, not heavier.
- Preserve all existing actions: start, complete, emergency complete, move back, upload documents, record payment.

## Tasks

1. Restyle workflow tabs and cards as an operations board.
2. Restyle workflow step cards for clearer next action.
3. Restyle document upload panel enough to match the page.
4. Restyle financial summary/payment form for the new visual system.
5. Browser-use verification on the active client page.
6. Run tests/typecheck/lint before commit.
