---
status: complete
completed: "2026-04-30"
quick_id: "260430-4ul"
slug: "simplify-clients-list-ux-for-finding-and"
---

# Summary: Simplify Clients List UX

## Completed

- Removed the card/table view toggle from the main page.
- Made search and add-client the two clear actions.
- Kept clients as simple cards so staff do not choose a view mode.
- Clarified that startup documents are uploaded once during client creation.
- Restyled client cards to match the operations UI.

## Verification

- `pnpm test` passed.
- `pnpm typecheck` passed.
- `pnpm lint` passed with warnings only.
- Browser-use verified `/clients` and the add-client dialog.

## Files Changed

- `src/app/(dashboard)/clients/page.tsx`
- `src/components/client/ClientCard.tsx`
