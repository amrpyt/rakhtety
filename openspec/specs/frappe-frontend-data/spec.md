## Requirements

### Requirement: Frappe-Only Frontend Data Access
The frontend SHALL read and write application data through the Frappe backend instead of Supabase.

#### Scenario: Client data loads from Frappe
- **WHEN** the UI loads a client, workflow, employee, dashboard, or document view
- **THEN** the data comes from a Frappe-backed API path

#### Scenario: Write actions use Frappe
- **WHEN** the UI creates, updates, uploads, or completes workflow data
- **THEN** the frontend sends the change to Frappe and renders the returned state

### Requirement: No Supabase Build Dependency
The frontend build SHALL not require Supabase environment variables or Supabase SDK initialization.

#### Scenario: Production build succeeds without Supabase secrets
- **WHEN** the app is built for production with only Frappe-related environment variables
- **THEN** the build completes without missing Supabase configuration errors

### Requirement: Frappe-Backed Session Handling
The frontend SHALL use a Frappe-backed session or equivalent local session wrapper for auth state.

#### Scenario: Session is available after login
- **WHEN** a user logs in through the frontend
- **THEN** the frontend can read the logged-in session from the Frappe-backed auth flow

#### Scenario: Logout clears session
- **WHEN** the user logs out
- **THEN** the frontend clears the active session and shows the unauthenticated state

### Requirement: Stable UI Contract
The frontend SHALL keep the current user-facing workflow screens and actions stable while the backend source changes.

#### Scenario: Existing screens still work
- **WHEN** a user opens the current workflow pages
- **THEN** the pages render and behave the same from the user's perspective
