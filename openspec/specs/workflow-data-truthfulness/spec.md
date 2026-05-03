## Requirements

### Requirement: Placeholder workflow steps must not show accounting values
The system SHALL NOT display fees, costs, office profit, or similar accounting amounts for placeholder workflow steps that were generated from frontend templates instead of backend step records.

#### Scenario: Workflow exists without backend steps
- **WHEN** a workflow is returned from the backend with an empty `steps` array and the UI renders template placeholder steps
- **THEN** those placeholder steps MUST show step names/status guidance without fees or profit amounts

#### Scenario: Real workflow step includes accounting values
- **WHEN** a workflow step is returned from the backend with fees or profit fields
- **THEN** the UI MUST continue to display those values as step accounting data

### Requirement: Document upload accounting must remain tied to real steps
The system SHALL only show document-upload accounting inputs for real workflow steps that can be acted on.

#### Scenario: Placeholder step is shown
- **WHEN** a placeholder step is rendered
- **THEN** the UI MUST NOT show document upload accounting inputs for that placeholder

#### Scenario: Real in-progress step is shown
- **WHEN** a real step is in progress and can accept documents
- **THEN** the UI MUST show the file upload controls with editable accounting inputs

### Requirement: Static operational data must be auditable
The implementation SHALL identify UI/data fallbacks that present static values as operational system data.

#### Scenario: Static fallback scan runs
- **WHEN** the change is implemented
- **THEN** the team MUST receive a list of static fallback candidates and whether each should be fixed now or reviewed later
