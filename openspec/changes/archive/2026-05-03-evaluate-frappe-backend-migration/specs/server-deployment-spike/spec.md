## ADDED Requirements

### Requirement: Server readiness is inspected
The spike SHALL inspect the target server before choosing an installation path.

#### Scenario: Server facts are collected
- **WHEN** the server is accessed for the spike
- **THEN** the OS, CPU, memory, disk, open ports, package manager, and existing web services are recorded without exposing passwords or secrets

### Requirement: Deployment path is proven
The spike SHALL prove that the selected Frappe deployment path can run on the user's server.

#### Scenario: Frappe test site starts
- **WHEN** the selected deployment method is applied
- **THEN** a test Frappe site starts successfully and responds to HTTP requests

### Requirement: Frontend and backend routing is planned
The spike SHALL define how the office will reach the Rakhtety frontend and Frappe backend.

#### Scenario: Routes are documented
- **WHEN** deployment planning is complete
- **THEN** the plan identifies frontend URL, backend/admin URL, HTTPS approach, and reverse proxy routing

### Requirement: Backup path is proven
The spike SHALL prove a basic backup path for database and uploaded files.

#### Scenario: Backup artifact is created
- **WHEN** the backup command or job runs
- **THEN** it creates a restorable backup for the test database and uploaded files

#### Scenario: Restore smoke test succeeds
- **WHEN** the restore smoke test runs against test data
- **THEN** the restored test site or data can be read successfully

### Requirement: Operational checks are documented
The spike SHALL document the minimum checks needed to operate the server-hosted app.

#### Scenario: Health checks are available
- **WHEN** the deployment is running
- **THEN** there is a documented way to check app status, backend status, logs, disk usage, and backup freshness
