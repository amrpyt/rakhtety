# Employee Access Proof

Timestamp: 2026-05-03 18:05 +03:00

## What was added

Added an isolated proof page:

- API: `/api/spikes/frappe/assigned-work?employee=<employee>`
- Page: `/spikes/frappe/employee?employee=<employee>`

The API calls the Frappe spike method:

```text
frappe.rakhtety_spike.assigned_work
```

This is a read-only proof that the custom frontend can ask Frappe for work assigned to one employee.

## Browser Use verification

Checked in the headed in-app browser.

### Ahmed Employee

URL:

```text
http://localhost:3010/spikes/frappe/employee?employee=Ahmed%20Employee
```

Observed:

- Page heading: `Ahmed Employee`
- Page showed `Test Client One` work.
- Page did not show `Blocked Client`.

### Blocked Employee

URL:

```text
http://localhost:3010/spikes/frappe/employee?employee=Blocked%20Employee
```

Observed:

- Page heading: `Blocked Employee`
- Page showed `Blocked Client` work.
- Page did not show `Test Client One`.

## Limit

This proves employee assignment filtering in the spike method and custom frontend. It does not yet prove full Frappe user login permissions, because the spike still logs into Frappe as Administrator from the Next.js server. Production must move this into a real Frappe custom app with proper roles, permissions, and user-linked employees.
