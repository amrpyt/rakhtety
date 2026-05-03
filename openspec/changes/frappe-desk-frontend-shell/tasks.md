## 1. OpenSpec and Research

- [x] 1.1 Capture current Frappe Desk and Frappe UI docs guidance in `design.md`.
- [x] 1.2 Create proposal, specs, and design artifacts for the Desk-like frontend change.
- [x] 1.3 Run strict OpenSpec validation before implementation.

## 2. Shared Desk Shell

- [ ] 2.1 Replace the dashboard shell chrome with a Frappe Desk-inspired layout: persistent module sidebar, top awesomebar-style strip, and compact content frame.
- [ ] 2.2 Restyle global CSS tokens toward a restrained light desk palette with low-radius surfaces and subtle borders.
- [ ] 2.3 Keep role-aware navigation and mobile navigation behavior intact.

## 3. Shared UI Surfaces

- [ ] 3.1 Restyle shared card, table, button, and badge primitives for compact ERP desk use.
- [ ] 3.2 Add reusable page header/workspace surface treatment for dashboard routes.
- [ ] 3.3 Update the dashboard landing page to read like a Frappe Workspace instead of a decorative dashboard page.

## 4. Verification and Commit

- [ ] 4.1 Run `openspec validate frappe-desk-frontend-shell --strict`.
- [ ] 4.2 Run project checks for the edit round.
- [ ] 4.3 Run Browser Use smoke verification on local dashboard routes.
- [ ] 4.4 Commit the green edit round.
