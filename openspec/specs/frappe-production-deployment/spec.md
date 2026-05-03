# frappe-production-deployment Specification

## Purpose
TBD - created by archiving change productionize-frappe-custom-app. Update Purpose after archive.
## Requirements
### Requirement: Git Based Deployment Source
The system SHALL use Git-tracked code as the source of truth for the Frappe app and deployment configuration.

#### Scenario: No manual production patch
- **WHEN** production Frappe code changes are needed
- **THEN** the change is committed to Git and deployed from Git-tracked files instead of editing files directly inside a running container

### Requirement: Custom Docker Image
The deployment SHALL build or pull a custom Frappe Docker image that includes `rakhtety_frappe`.

#### Scenario: App present in image
- **WHEN** the Frappe backend container starts from the production image
- **THEN** `rakhtety_frappe` is available in the bench apps list before site migration

### Requirement: Safe App Install and Migration
The deployment SHALL install and migrate the app with explicit backup and rollback steps.

#### Scenario: Backup before migration
- **WHEN** a deployment will run app install or migration
- **THEN** a database and file backup is created first

#### Scenario: Migration succeeds
- **WHEN** migration completes
- **THEN** the site serves the app and all required Frappe services are healthy

#### Scenario: Migration fails
- **WHEN** migration fails
- **THEN** the operator can return to the previous image tag and restore the pre-migration backup

### Requirement: HTTPS Deployment Path
The deployment SHALL provide a working HTTPS path for the office to test the app.

#### Scenario: Named tunnel path
- **WHEN** direct DNS or inbound ports are not ready
- **THEN** a named Cloudflare Tunnel or equivalent stable tunnel exposes the app over HTTPS

#### Scenario: Direct Traefik path
- **WHEN** DNS points to the server and inbound `80/443` are open
- **THEN** Traefik serves the app with trusted SSL for the configured domain

### Requirement: Backup and Restore Drill
The deployment SHALL prove restore on a clean target before real production data migration.

#### Scenario: Clean restore proof
- **WHEN** a backup is restored into a clean Frappe target that has `rakhtety_frappe` installed
- **THEN** workflow data, file records, and app APIs work after restore

### Requirement: Operational Logs
The deployment SHALL document how to inspect logs for web, workers, database, queue, websocket, tunnel, and proxy services.

#### Scenario: Debug production issue
- **WHEN** an operator investigates a production issue
- **THEN** the documented log commands show the relevant service output without changing production code

