## Why

The Frappe backend spike proved the idea, but it used patched Python inside a running container. That is okay for learning, but not okay for real office production because the code is not packaged, versioned, deployable, or safely restorable.

This change moves the spike into a proper Frappe custom app and deployment path so future changes come from Git and repeatable Docker builds, not manual SSH edits.

## What Changes

- Create a real `rakhtety_frappe` Frappe app for Rakhtety backend logic.
- Move the spike DocTypes, workflow rules, document gate, employee assignment filtering, and whitelisted API methods into that app.
- Add fixtures, patches, and tests so the app can be installed on a clean Frappe site.
- Define a Docker production path using a custom/layered image with the app included.
- Define a deploy flow where the server pulls/builds versioned code, then runs migrate/build/restart steps.
- Keep the current Next.js app as the Arabic office frontend.
- Remove the production dependency on ad hoc patched files inside the running Frappe container.

## Capabilities

### New Capabilities

- `frappe-custom-app`: Package Rakhtety backend data model, workflow logic, APIs, permissions, and tests as a Frappe custom app.
- `frappe-production-deployment`: Deploy the custom Frappe app through a repeatable Docker/Git path with backup, migration, logs, and rollback expectations.

### Modified Capabilities

None.

## Impact

- Frappe server code under a new app package.
- Frappe DocTypes and role/permission rules.
- Next.js Frappe spike integration may change endpoint names after app install.
- Docker image/build process for the server.
- Deployment notes, backup/restore notes, and `learning.md`.
