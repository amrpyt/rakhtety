## ADDED Requirements

### Requirement: Desk-like dashboard shell
The system SHALL render authenticated application routes inside a Frappe Desk-inspired shell with persistent module navigation, a top search/action area, and compact content density.

#### Scenario: Authenticated route shows desk chrome
- **WHEN** an authenticated user opens a dashboard route
- **THEN** the route shows a persistent module sidebar
- **AND** the route shows a top bar with search/action affordances
- **AND** the main content uses compact work-surface spacing

#### Scenario: Module navigation stays role-aware
- **WHEN** a user role does not have access to a route
- **THEN** the Desk-like sidebar hides that route using the existing route permission rules

### Requirement: Desk-like shared components
The system SHALL style shared cards, buttons, tables, badges, and page panels to match a restrained ERP desk surface.

#### Scenario: Shared components are compact
- **WHEN** a dashboard page renders shared UI primitives
- **THEN** cards, buttons, tables, and badges use low-radius borders, subtle dividers, and dense spacing suitable for repeated office work

#### Scenario: Tables read like list views
- **WHEN** a page renders tabular or list content
- **THEN** the content appears as a dense list-view surface with clear row borders, small headers, and visible hover states

### Requirement: Arabic RTL desk experience
The system SHALL keep Arabic right-to-left behavior while adopting the Desk-like shell.

#### Scenario: Root RTL remains source of direction
- **WHEN** the app renders any dashboard route
- **THEN** `dir="rtl"` remains on the root HTML element
- **AND** the shell does not require per-component RTL overrides to display correctly

#### Scenario: Mixed technical tokens remain readable
- **WHEN** a route includes English technical labels, URLs, IDs, or numbers
- **THEN** those tokens remain visually readable inside the Arabic layout

### Requirement: Mobile desk navigation
The system SHALL provide a compact mobile navigation pattern that preserves access to the same role-visible modules.

#### Scenario: Mobile user can switch modules
- **WHEN** the viewport is below the desktop sidebar breakpoint
- **THEN** the user can switch between the same role-visible modules through compact mobile navigation

#### Scenario: Mobile content is not covered
- **WHEN** mobile navigation is visible
- **THEN** page content has enough bottom spacing to avoid being hidden behind it
