## ADDED Requirements

### Requirement: Employee client creation
The system SHALL allow authenticated employees, managers, and admins to create client files from the Clients page.

#### Scenario: Employee sees add-client action
- **WHEN** an authenticated employee opens the Clients page
- **THEN** the page shows the add-client action

#### Scenario: Employee submits new client
- **WHEN** an authenticated employee submits valid client data
- **THEN** `POST /api/clients` creates the client instead of returning a permission error

### Requirement: Step document accounting
The system SHALL let the user enter step accounting numbers in the same panel used to upload a workflow-step document.

#### Scenario: Accounting fields appear beside document upload
- **WHEN** an in-progress workflow step shows its document upload panel
- **THEN** the panel includes inputs for government cost/fee and office fee/profit for that step

#### Scenario: Uploaded document updates step accounting
- **WHEN** the user uploads a workflow-step document with valid accounting numbers
- **THEN** the uploaded document is saved
- **AND** the workflow step's accounting values are updated from the submitted numbers

### Requirement: Current user job title display
The system SHALL show the authenticated user's assigned employee position/job title in the dashboard shell when one exists.

#### Scenario: User has an assigned position
- **WHEN** the current user has a linked employee record with a position or role label
- **THEN** the sidebar profile text shows that position/title instead of the generic role label

#### Scenario: User has no assigned position
- **WHEN** the current user has no linked employee position/title
- **THEN** the sidebar falls back to the localized role label
