## Frappe Backend Proof

Date: 2026-05-03

## Test Deployment

- Server user used for SSH: `ubuntu`
- Frappe stack path on server: `~/rakhtety-spike/frappe_docker`
- Deployment method: Docker Compose using Frappe Docker `pwd.yml`
- Frappe/ERPNext image: `frappe/erpnext:v16.16.0`
- Local server URL: `http://127.0.0.1:8080` on the server
- Public port `8080` is not reachable from local machine, so local testing used an SSH tunnel from `localhost:8081` to server `127.0.0.1:8080`.

## Created Test Backend Slice

Created custom Rakhtety spike objects inside the test Frappe site:

- `Rakhtety Client`
- `Rakhtety Employee`
- `Rakhtety Workflow`
- `Rakhtety Workflow Step`
- `Rakhtety Document`
- Role: `Rakhtety Employee`

Seeded records:

- Client: `Test Client One`
- Employee: `Ahmed Employee`
- Device License workflow: `Test Client One - Device License`
- Device License steps: 5
- Excavation Permit workflow: created only after Device License completion

## Rules Proven

- Device License can store the five Rakhtety steps.
- Workflow steps store Arabic names, assigned employee, government fees, and office profit.
- Assigned work query returns only work assigned to `Ahmed Employee`.
- Completing a step with `requires_document = 1` is blocked until the required document marker exists.
- Starting Excavation Permit is blocked until Device License is completed.
- After all Device License steps are completed, Frappe marks the workflow as `Completed`.
- After Device License completion, Excavation Permit can be started.

## HTTP API Proof

Frappe login worked through:

```text
POST /api/method/login
```

The custom workflow read method worked through:

```text
GET /api/method/frappe.rakhtety_spike.get_client_workflow?client=Test%20Client%20One
```

The response returned:

- client fields
- Device License workflow
- completed Device License steps
- Arabic step names
- finance fields
- required document flag
- Excavation Permit workflow after unlock

## Next.js Integration Proof

Added isolated local route:

```text
/api/spikes/frappe/client-workflow
```

Required env vars:

```text
FRAPPE_BASE_URL
FRAPPE_USERNAME
FRAPPE_PASSWORD
```

Local test:

```text
FRAPPE_BASE_URL=http://localhost:8081
GET http://localhost:3010/api/spikes/frappe/client-workflow?client=Test%20Client%20One
```

Result: Next.js successfully logged into Frappe and returned the client workflow JSON.

## Notes

- This is a spike implementation, not production architecture.
- The test Frappe module was placed inside the running Docker container for fast proof only.
- For production, this logic should move into a real Frappe custom app, not a patched module inside the container.
- The current public server firewall/network does not expose port `8080`, so real office access needs reverse proxy/domain planning next.
