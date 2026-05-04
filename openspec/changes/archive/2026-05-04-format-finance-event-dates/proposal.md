## Why

The Frappe Desk finance page currently shows payment event timestamps as raw machine strings like `2026-05-04T16:43:00.201112`. Office users need a normal readable date and a 12-hour clock.

## What Changes

- Format finance event `created_at` values in the shared Rakhtety Desk script before rendering them in the table.
- Use the browser-native `Intl.DateTimeFormat` API with Arabic Egypt locale and `hour12: true`.
- Bump the shared Desk script cache key so the running Desk page fetches the new JavaScript.
- Add regression coverage so raw finance timestamps do not come back silently.

## Impact

- Affected code: `frappe_apps/rakhtety_frappe/rakhtety_frappe/public/rakhtety/desk_sections.js`.
- Affected pages: Frappe Desk Rakhtety pages that load the shared script, especially `/desk/rakhtety-finance`.
- Not affected: stored database values, Frappe DocType schema, finance totals, payment logic, auth.

## Research

- MDN documents `Intl.DateTimeFormat` as the browser API for language-sensitive date/time formatting.
- MDN documents that `dateStyle` and `timeStyle` can be used together, and that `hour12` controls 12-hour time formatting.
