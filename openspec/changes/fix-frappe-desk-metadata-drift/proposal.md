## Why

The running Frappe v16 container has Rakhtety Desk Page, Workspace, shortcut, and alias metadata that is not present in the repository. That makes the local Desk UI work only because the container has untracked files. A rebuild or production deploy from the repository can lose the Rakhtety pages, the finance alias, and Arabic titles.

## What Changes

- Persist the Rakhtety Frappe Desk Page JSON and JavaScript files in the app source tree.
- Add the Desk metadata migration to the repository patches and migration hooks.
- Keep the legacy `rakhtety-financial` route as an alias that redirects to `rakhtety-finance`.
- Ensure the accounts/finance page title is stored as the Arabic `الحسابات`.
- Add regression tests that scan source metadata for missing pages, alias drift, and bad Arabic encoding markers.

## Impact

- Affected code: `frappe_apps/rakhtety_frappe/rakhtety_frappe/**`.
- Affected behavior: Frappe Desk navigation, Workspace links, Page titles, and old finance-route compatibility.
- Not affected: Next.js dashboard routes, Frappe DocType schema fields, auth/session behavior, business workflow rules.

## Research

- Frappe `bench migrate` runs patches, synchronizes fixtures and web/desk metadata, and then runs `after_migrate` hooks.
- Frappe hooks support `after_install` and `after_migrate` for app setup after installation and migration.
- Frappe Desk uses Workspace/Page metadata to render sidebar and page navigation.
