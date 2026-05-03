# frappe-custom-app Specification

## Purpose
TBD - created by archiving change productionize-frappe-custom-app. Update Purpose after archive.
## Requirements
### Requirement: Installable Rakhtety Frappe App
The system SHALL provide a `rakhtety_frappe` Frappe app that can be installed on a clean Frappe site without manually patching files inside a running container.

#### Scenario: Clean site install
- **WHEN** the app is installed on a clean Frappe test site
- **THEN** the site contains the Rakhtety DocTypes, roles, hooks, and API methods needed by the Next.js frontend

### Requirement: Rakhtety Backend DocTypes
The app SHALL define the backend records needed for the permit workflow: client, employee, workflow, workflow step, and document.

#### Scenario: DocTypes exist after migration
- **WHEN** `bench --site <site> migrate` completes after app installation
- **THEN** Frappe contains DocTypes for `Rakhtety Client`, `Rakhtety Employee`, `Rakhtety Workflow`, `Rakhtety Workflow Step`, and `Rakhtety Document`

### Requirement: Workflow Dependency Rule
The app SHALL block starting Excavation Permit until the client's Device License workflow is completed.

#### Scenario: Excavation blocked before device license completion
- **WHEN** a user or API call tries to start Excavation Permit for a client whose Device License is not completed
- **THEN** Frappe rejects the action with a clear validation error

#### Scenario: Excavation starts after device license completion
- **WHEN** a client has a completed Device License workflow
- **THEN** Frappe allows starting the Excavation Permit workflow

### Requirement: Required Document Gate
The app SHALL block completion of a step that requires a document until the required document is uploaded or recorded.

#### Scenario: Required document missing
- **WHEN** a required-document step is completed before document upload
- **THEN** Frappe rejects the step completion

#### Scenario: Required document uploaded
- **WHEN** the required document is uploaded or recorded for the step
- **THEN** Frappe allows completing the step

### Requirement: Employee Assignment Visibility
The app SHALL expose assigned work so employees only receive work assigned to them unless their role allows wider access.

#### Scenario: Employee sees assigned work only
- **WHEN** an employee requests assigned work
- **THEN** Frappe returns records assigned to that employee and omits unrelated employee work

#### Scenario: Manager sees wider work
- **WHEN** a manager requests workflow work
- **THEN** Frappe returns the manager-authorized workflow scope

### Requirement: Stable Next.js API Contract
The app SHALL expose whitelisted methods for the Next.js frontend to read workflows, update steps, upload or record required documents, start Excavation Permit, and read assigned work.

#### Scenario: Frontend reads workflow
- **WHEN** Next.js calls the client workflow method for a valid client
- **THEN** Frappe returns client, workflow, step, assignment, document, and finance fields in a stable shape

#### Scenario: Frontend writes workflow
- **WHEN** Next.js calls a workflow write method with valid permissions and data
- **THEN** Frappe persists the change and returns the updated state

### Requirement: Automated Frappe Tests
The app SHALL include tests for the critical workflow, document, permission, and API behavior.

#### Scenario: Tests run in bench
- **WHEN** the app test command runs for `rakhtety_frappe`
- **THEN** tests prove dependency blocking, document gate blocking, employee assignment filtering, and successful API writes

