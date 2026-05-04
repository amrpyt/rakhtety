## Design

Keep the database value unchanged and format only at the UI edge.

The server should continue returning ISO-like timestamps because that is stable for sorting and APIs. The Desk table should convert those values into human-readable text immediately before calling the existing `cell()` helper.

Use `new Intl.DateTimeFormat("ar-EG", { dateStyle: "medium", timeStyle: "short", hour12: true })` because:

- it keeps the UI Arabic-friendly,
- it avoids a new date library,
- it makes the 12-hour clock explicit,
- it gracefully follows the user's browser timezone.

If a value is empty, show an empty cell. If a value cannot be parsed as a date, keep the original value instead of hiding potentially useful data.

## Cache Behavior

Each Desk page loads `/assets/rakhtety_frappe/rakhtety/desk_sections.js` with a query-string version. Update that version so Frappe Desk and the browser do not reuse the older raw-date script.
