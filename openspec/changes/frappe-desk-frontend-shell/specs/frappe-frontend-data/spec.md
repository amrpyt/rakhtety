## MODIFIED Requirements

### Requirement: Stable UI Contract
The frontend SHALL keep the current user-facing workflow screens and actions stable while the backend source changes and while the visual shell moves toward a Frappe Desk-inspired experience.

#### Scenario: Existing screens still work
- **WHEN** a user opens the current workflow pages
- **THEN** the pages render the same business actions from the user's perspective
- **AND** the visual shell may change to Desk-like navigation and work surfaces

#### Scenario: Existing actions still use existing data contracts
- **WHEN** a user creates, edits, uploads, completes, or filters workflow data
- **THEN** the frontend continues using the existing API/hook contracts for that action
- **AND** the Desk-like UI change does not require new backend payload shapes
