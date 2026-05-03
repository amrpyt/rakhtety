## Next.js Write And Upload Proof

Date: 2026-05-03

## What Was Added

Added isolated spike APIs:

```text
POST /api/spikes/frappe/upload-document
POST /api/spikes/frappe/update-step
POST /api/spikes/frappe/start-excavation
```

Added a small control panel to:

```text
/spikes/frappe
```

The page can now:

- upload a required document marker to Frappe
- complete the next pending workflow step in Frappe
- try to start Excavation Permit

## Test Client

Created a second test client in Frappe:

```text
Blocked Client
```

It started with:

- Device License: `In Progress`
- one pending required-document step
- Excavation Permit locked

## Proof

### Dependency block

Request:

```text
POST /api/spikes/frappe/start-excavation
client=Blocked Client
```

Result:

```text
Excavation Permit is locked until Device License is completed
```

### Upload required document

Request:

```text
POST /api/spikes/frappe/upload-document
step=Blocked Client - Eligibility Statement
```

Result:

```text
Blocked Client - Eligibility Statement - Required Document
```

### Complete workflow step

Request:

```text
POST /api/spikes/frappe/update-step
step=Blocked Client - Eligibility Statement
status=completed
```

Result:

```json
{
  "step": "Blocked Client - Eligibility Statement",
  "status": "completed",
  "workflow_status": "Completed"
}
```

### Start Excavation after completion

Request:

```text
POST /api/spikes/frappe/start-excavation
client=Blocked Client
```

Result:

```text
Blocked Client - Excavation Permit
```

## Browser Use Proof

Browser Use headed runtime loaded:

```text
http://localhost:3010/spikes/frappe?client=Blocked%20Client
```

DOM proof showed:

- `Blocked Client`
- `Device License`
- `Completed`
- `المستند: مرفوع`
- `Excavation Permit`
- `In Progress`

The screenshot capture timed out, but DOM verification succeeded.

## Notes

- This is still a spike.
- The Frappe functions are patched inside the running Frappe container for speed.
- Production needs these methods in a real Frappe custom app.
