## Context

The completed `evaluate-frappe-backend-migration` spike proved that Frappe can hold Rakhtety workflow data and that Next.js can read/write it. The weak part is how the spike was delivered: a Python file was patched directly into a running Frappe container over SSH.

Frappe best practice is to package business code as a Frappe app. Frappe docs define an app as a Python package inside `frappe-bench/apps`, registered in `apps.txt`, with app files such as `hooks.py`, `modules.txt`, `patches.txt`, DocTypes, controllers, and tests.

Frappe Docker best practice for real custom apps is to build a custom/layered image with `apps.json`. The official Docker docs say the plain production image is for quick starts or exploration and is not customizable with `apps.json`; real deployments with custom apps should use `custom` or `layered`.

## Goals / Non-Goals

**Goals:**

- Create a real `rakhtety_frappe` app that can be installed on a clean Frappe site.
- Move Rakhtety backend model and methods from the patched spike file into app-owned modules.
- Make the app installable, testable, backup-friendly, and deployable from Git.
- Keep the Next.js frontend as the Arabic office interface.
- Make SSH a debugging/deployment transport only, not the source of truth.

**Non-Goals:**

- Rebuild the full office UI in Frappe Desk.
- Migrate real production data in this change.
- Replace the existing Next.js frontend.
- Build a full CI/CD platform before the first productionized app proof.

## Decisions

### Use a Frappe custom app, not server scripts or container patches

Decision: create `rakhtety_frappe`.

Reason: Rakhtety needs DocTypes, workflow rules, file/document rules, employee filtering, and API methods. That is real backend code, not a tiny script.

Alternative considered: keep patching `frappe.rakhtety_spike.py` into the container. Rejected because it is not versioned inside an app, not cleanly reinstallable, and not a trustworthy restore target.

### Use app-owned DocTypes and controllers

Decision: define DocTypes in the app and put business rules in controllers/services.

Initial DocTypes:

- `Rakhtety Client`
- `Rakhtety Employee`
- `Rakhtety Workflow`
- `Rakhtety Workflow Step`
- `Rakhtety Document`

Reason: these match the proven spike model and keep the migration small.

Alternative considered: reuse ERPNext doctypes heavily from day one. Rejected for now because the office workflow is permit-specific and we need a clean proof before adding ERPNext complexity.

### Use whitelisted methods as the Next.js contract

Decision: expose a small API surface from `rakhtety_frappe.api`.

Initial methods:

- `get_client_workflow`
- `upload_required_document`
- `update_step_status`
- `start_excavation`
- `assigned_work`

Reason: the current Next.js integration already proved this shape works.

Alternative considered: make Next.js call generic Frappe DocType REST only. Rejected because the workflow dependency and document gate are business rules; they must live behind backend methods.

### Use real Frappe roles and permission checks

Decision: replace Administrator-only server calls with user/role-aware checks.

Reason: the spike proved assignment filtering, but it did not prove full Frappe permission security. Production must link users to employees and enforce assigned-work visibility in Frappe, not only in frontend display.

Alternative considered: keep one Administrator API user in Next.js. Rejected for production because one broad credential is too much power.

### Use Docker custom/layered image for deployment

Decision: build a custom Frappe image containing `rakhtety_frappe` via `apps.json`.

Reason: official Frappe Docker docs state custom/layered images are the production path for custom apps, while the production image is for quick starts/exploration.

Alternative considered: SSH into the server and run `bench get-app` manually. Rejected because docs warn SSH bench edits can fail to persist across bench updates and can break the update flow.

## Risks / Trade-offs

- [Risk] Frappe permission rules are easy to misconfigure. -> Mitigation: add tests for admin, manager, employee, assigned work, and unrelated work.
- [Risk] Docker image builds with private app repos can leak tokens if passed badly. -> Mitigation: use BuildKit secret for `apps.json` and never use build args for secrets.
- [Risk] First productionized app may drift from the spike methods. -> Mitigation: keep the initial API names close to the spike and update Next.js only after tests pass.
- [Risk] Restore proof can be fake if code is not in the backup target. -> Mitigation: restore into a clean site with the custom app installed, then verify workflow data and files.
- [Risk] Server DNS/ports are still blocked for direct Traefik SSL. -> Mitigation: use a named Cloudflare Tunnel first, then fix DNS/provider firewall when ready.

## Migration Plan

1. Scaffold `rakhtety_frappe` locally or inside a disposable Frappe dev container.
2. Add app metadata, `required_apps`, module structure, DocTypes, controllers, fixtures, and patches.
3. Add automated Frappe tests for workflow dependency, document gate, assigned-work filtering, and API behavior.
4. Build a custom/layered Docker image containing the app.
5. Install the app on a clean test Frappe site.
6. Point the existing Next.js spike endpoints to the app methods.
7. Verify with Browser Use through the custom frontend.
8. Back up the test site, restore into a clean target, and verify the restored app works.
9. Promote only after rollback steps are documented.

Rollback:

- Keep the current spike stack untouched until the clean custom-app stack passes.
- If the custom image fails, switch containers back to the last working image tag.
- Restore the last known-good site backup if migrations corrupt test data.

## Open Questions

- Should `rakhtety_frappe` live inside this repo first, or in a separate Git repo that the Docker build pulls with `apps.json`?
- Should production use a named Cloudflare Tunnel immediately, or wait for DNS/provider firewall cleanup?
- Should ERPNext stay installed during the first productionized proof, or should the app depend only on Frappe Framework until finance/invoicing is actually needed?
