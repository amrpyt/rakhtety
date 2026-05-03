## 1. App Scaffold

- [ ] 1.1 Decide final app location: inside this repo or separate Git repo.
- [ ] 1.2 Create `rakhtety_frappe` app scaffold with Frappe app metadata.
- [ ] 1.3 Add `required_apps`, `modules.txt`, `patches.txt`, and app package structure.
- [ ] 1.4 Verify the app can be discovered by bench and appears in the apps list.

## 2. Data Model

- [ ] 2.1 Add `Rakhtety Client` DocType.
- [ ] 2.2 Add `Rakhtety Employee` DocType linked to Frappe User.
- [ ] 2.3 Add `Rakhtety Workflow` DocType.
- [ ] 2.4 Add `Rakhtety Workflow Step` DocType.
- [ ] 2.5 Add `Rakhtety Document` DocType with file attachment field.
- [ ] 2.6 Add role and permission fixtures for admin, manager, and employee access.
- [ ] 2.7 Add install/migration patch for required default records and indexes.

## 3. Backend Logic

- [ ] 3.1 Implement service/controller logic for Device License workflow creation.
- [ ] 3.2 Implement service/controller logic for Excavation Permit start.
- [ ] 3.3 Enforce Excavation Permit dependency on completed Device License.
- [ ] 3.4 Enforce required-document gate before step completion.
- [ ] 3.5 Implement employee assigned-work query with role-aware filtering.
- [ ] 3.6 Implement finance fields for government fees and office profit on workflow steps.

## 4. API Contract

- [ ] 4.1 Add whitelisted method for `get_client_workflow`.
- [ ] 4.2 Add whitelisted method for `upload_required_document`.
- [ ] 4.3 Add whitelisted method for `update_step_status`.
- [ ] 4.4 Add whitelisted method for `start_excavation`.
- [ ] 4.5 Add whitelisted method for `assigned_work`.
- [ ] 4.6 Update Next.js spike endpoints to call the custom app method paths.

## 5. Tests

- [ ] 5.1 Add Frappe unit tests for clean app install and DocType availability.
- [ ] 5.2 Add Frappe tests for Device License completion and Excavation Permit dependency.
- [ ] 5.3 Add Frappe tests for required-document gate.
- [ ] 5.4 Add Frappe tests for employee assigned-work visibility.
- [ ] 5.5 Add Frappe tests for whitelisted API methods.
- [ ] 5.6 Run Next.js `npm run typecheck` and `npm run lint`.

## 6. Docker Deployment

- [ ] 6.1 Create `apps.json` or equivalent app-source config for the custom image.
- [ ] 6.2 Build a custom/layered Frappe Docker image containing `rakhtety_frappe`.
- [ ] 6.3 Start a clean Frappe test site from the custom image.
- [ ] 6.4 Install `rakhtety_frappe` on the clean test site.
- [ ] 6.5 Run migrate/build/restart and verify all Frappe services are healthy.

## 7. Browser Verification

- [ ] 7.1 Use Browser Use to verify the Next.js frontend reads workflow from the custom app.
- [ ] 7.2 Use Browser Use to verify step update through the custom app.
- [ ] 7.3 Use Browser Use to verify required document upload through the custom app.
- [ ] 7.4 Use Browser Use to verify Excavation Permit dependency through the custom app.
- [ ] 7.5 Use Browser Use to verify employee access does not show unrelated work.

## 8. Backup, Restore, and Rollback

- [ ] 8.1 Create database and file backup before migration/install.
- [ ] 8.2 Restore backup into a clean target with `rakhtety_frappe` installed.
- [ ] 8.3 Verify restored workflow data, files, and APIs.
- [ ] 8.4 Document rollback to previous image tag and pre-migration backup.
- [ ] 8.5 Document log commands for backend, frontend, workers, database, websocket, tunnel, and proxy.

## 9. Decision Gate

- [ ] 9.1 Record whether custom-app deployment is ready for real data migration.
- [ ] 9.2 List blockers before production migration.
- [ ] 9.3 Update `learning.md` with the productionized Frappe app learnings.
