## ADDED Requirements

### Requirement: Frappe models core Rakhtety business records
The spike SHALL model the minimum Rakhtety backend slice in Frappe using test data only.

#### Scenario: Core records exist
- **WHEN** the spike Frappe site is inspected
- **THEN** it contains test DocTypes or equivalent records for client, workflow, workflow step, employee assignment, document, and finance fields

### Requirement: Next.js can use Frappe as backend
The spike SHALL prove that the Rakhtety frontend can read and write the Frappe backend through API calls without using Frappe Desk as the daily office UI.

#### Scenario: Frontend reads Frappe data
- **WHEN** the test Rakhtety frontend requests a client workflow from Frappe
- **THEN** it receives the client, workflow, steps, assignment, document status, and finance fields

#### Scenario: Frontend writes Frappe data
- **WHEN** a test user updates a workflow step from the Rakhtety frontend
- **THEN** Frappe persists the updated step state and returns the updated record

### Requirement: Workflow dependency is preserved
The spike SHALL preserve the Rakhtety rule that Excavation Permit cannot start until Device License is complete.

#### Scenario: Excavation blocked before device license completion
- **WHEN** a test user tries to start Excavation Permit for a client whose Device License is not complete
- **THEN** the backend rejects or blocks the action

#### Scenario: Excavation allowed after device license completion
- **WHEN** Device License is complete for a test client
- **THEN** the backend allows Excavation Permit to be created or started

### Requirement: Assigned employee visibility is proven
The spike SHALL prove that employee users can be limited to assigned workflow work.

#### Scenario: Employee sees assigned work
- **WHEN** a test employee requests their workflow queue
- **THEN** the response includes workflows or steps assigned to that employee

#### Scenario: Employee does not see unrelated work
- **WHEN** a test employee requests another employee's workflow data
- **THEN** the backend denies access or excludes that data

### Requirement: Required document flow is proven
The spike SHALL prove one required workflow document can be uploaded, stored, and used as a completion gate.

#### Scenario: Step completion blocked before document upload
- **WHEN** a test user attempts to complete a step that requires a document before uploading it
- **THEN** the backend blocks the completion

#### Scenario: Step completion allowed after document upload
- **WHEN** the required document is uploaded for the test step
- **THEN** the backend allows the step to be completed

### Requirement: Go/no-go decision is produced
The spike SHALL end with a written decision that recommends migrate, do not migrate, or run a second spike.

#### Scenario: Spike is reviewed
- **WHEN** the spike checks are complete
- **THEN** the result states the recommendation, evidence, blockers, and next step
