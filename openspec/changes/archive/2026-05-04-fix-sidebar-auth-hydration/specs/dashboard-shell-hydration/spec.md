## ADDED Requirements

### Requirement: Dashboard shell hydrates with stable auth markup

The system SHALL render dashboard shell auth-dependent navigation from the same initial auth state on the server and on the first browser render.

#### Scenario: Browser has a local auth session before hydration

- **WHEN** the browser has a local Rakhtety session cookie before the dashboard shell hydrates
- **THEN** the first browser render MUST match the server-rendered dashboard shell markup
- **AND** auth-dependent navigation MAY update only after hydration completes

#### Scenario: Browser has no local auth session

- **WHEN** the browser has no local Rakhtety session cookie before the dashboard shell hydrates
- **THEN** the first browser render MUST match the server-rendered dashboard shell markup
