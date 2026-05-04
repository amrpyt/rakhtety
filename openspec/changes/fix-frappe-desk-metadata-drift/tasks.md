## 1. TDD Regression Coverage

- [x] 1.1 Add a failing test for missing Rakhtety Desk Page JSON files and Arabic titles.
- [x] 1.2 Add a failing test for the legacy `rakhtety-financial` alias.
- [x] 1.3 Add a failing test for Desk migration hooks and mojibake markers.

## 2. Metadata Fix

- [x] 2.1 Persist Rakhtety custom Page JSON/JS files in the repository.
- [x] 2.2 Persist shared Desk assets and metadata migration code in the repository.
- [x] 2.3 Wire the migration into `patches.txt`, `after_install`, and `after_migrate`.
- [x] 2.4 Correct the command-center Page JSON title to Arabic.

## 3. Verification

- [x] 3.1 Run the focused metadata test.
- [x] 3.2 Run `openspec validate fix-frappe-desk-metadata-drift --strict`.
- [x] 3.3 Run project tests/checks.
- [x] 3.4 Run Frappe migration and verify Page/Workspace rows.
- [x] 3.5 Run Browser Use smoke check for Desk pages.
