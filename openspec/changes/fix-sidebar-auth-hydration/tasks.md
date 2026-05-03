## 1. Auth Bootstrap

- [x] 1.1 Change `AuthProvider` so the initial `user` state is always `null`.
- [x] 1.2 Load the local session cookie through a hydration-safe browser snapshot after hydration.

## 2. Regression Coverage

- [x] 2.1 Add a provider startup test proving a local session cookie does not affect initial server-rendered markup.
- [x] 2.2 Run the focused test, project checks, and Browser Use verification for the dashboard route.
