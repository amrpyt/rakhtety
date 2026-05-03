## ADDED Requirements

### Requirement: Production Server Deployment
The deployment SHALL run the Rakhtety Frappe backend on the target production server using Git-tracked Docker Compose configuration and a custom image that includes `rakhtety_frappe`.

#### Scenario: Server deployment starts from tracked files
- **WHEN** the production deployment is started on the server
- **THEN** Docker Compose uses Git-tracked compose files and a server-local `.env` file instead of manual container edits

#### Scenario: Custom app exists in production backend
- **WHEN** the production Frappe backend container starts
- **THEN** `rakhtety_frappe` is available before site install or migration runs

### Requirement: Traefik Public HTTPS Routing
The deployment SHALL expose production services through Traefik with automatic HTTPS and no direct public backend container ports.

#### Scenario: HTTPS route works
- **WHEN** DNS points the selected hostname to the server and ports `80` and `443` are reachable
- **THEN** Traefik serves the selected hostname over trusted HTTPS

#### Scenario: HTTP redirects to HTTPS
- **WHEN** a user visits the selected hostname over HTTP
- **THEN** Traefik redirects the request to HTTPS

#### Scenario: Backend ports are private
- **WHEN** the deployment is running
- **THEN** Frappe backend, Redis, MariaDB, workers, and websocket containers are reachable through the Docker network and are not directly exposed as public ports

### Requirement: Production Environment Secrets
The deployment SHALL keep secrets out of Git and load production secrets from server-local environment files or the server secret store.

#### Scenario: Secrets stay local
- **WHEN** deployment configuration is committed
- **THEN** passwords, API keys, database credentials, and certificate private data are not present in Git-tracked files

### Requirement: Production Health Verification
The deployment SHALL provide documented checks for service health, HTTPS, Frappe API, Next.js integration, queue workers, scheduler, logs, disk, and backup freshness.

#### Scenario: Operator checks deployment health
- **WHEN** an operator runs the documented health checks
- **THEN** the checks show whether web, worker, scheduler, websocket, database, Redis, Traefik, and backups are healthy

#### Scenario: Browser verifies office workflow
- **WHEN** Browser Use opens the production HTTPS URL
- **THEN** the tested office workflow can read Frappe data and perform the expected workflow actions through the Next.js UI

### Requirement: Production Backup and Restore
The deployment SHALL create a backup before migration and prove that backup can be restored into a clean target.

#### Scenario: Backup before migration
- **WHEN** a production app install or migration is about to run
- **THEN** the operator creates a Frappe backup for database and files first

#### Scenario: Restore smoke passes
- **WHEN** the backup is restored into a clean smoke target
- **THEN** the restored target can read Rakhtety workflow data through the Frappe app API

### Requirement: Production Rollback
The deployment SHALL document and test a rollback path that returns the server to the previous working app version and data backup.

#### Scenario: Migration rollback
- **WHEN** a production migration fails
- **THEN** the operator can switch back to the previous image tag and restore the pre-migration backup
