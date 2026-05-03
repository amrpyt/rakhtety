# Final Spike Decision

Timestamp: 2026-05-03 18:05 +03:00

## Decision

Use Frappe as the backend, but keep Rakhtety's custom frontend.

Do not use the default Frappe Desk UI as the main office UI.

Simple version: Frappe should be the engine under the car. Rakhtety should still be the steering wheel and dashboard the office staff touch every day.

## Why

### API fit

Passed.

Next.js can log into Frappe and call custom Frappe methods. The spike proved:

- Read client workflows from Frappe.
- Upload a required document marker.
- Complete a workflow step.
- Start Excavation Permit after Device License completion.

### Workflow fit

Passed.

Frappe can represent:

- Client.
- Employee.
- Workflow.
- Workflow Step.
- Document.
- Government fees.
- Office profit.

The spike also proved the critical rule:

```text
Excavation Permit is locked until Device License is completed.
```

### Permission fit

Partially passed.

The spike proved employee assignment filtering:

- `Ahmed Employee` sees `Test Client One`.
- `Blocked Employee` sees `Blocked Client`.
- Each page hides the other employee's work.

But this is not full production permission proof yet. The Next.js spike uses Administrator credentials server-side. Production needs real Frappe users, roles, and permission rules.

### File fit

Passed for spike level.

The spike proved a required document gate and backup of uploaded file storage. Production still needs real file upload, storage rules, and file download permissions.

### Deployment fit

Partially passed.

Passed:

- Frappe Docker stack runs on the user's server.
- Traefik routes locally.
- Cloudflare Quick Tunnel gives working public HTTPS.
- Frappe services restart cleanly.
- Logs are available.
- Database and file backups can be created.

Blocked:

- `frappe-spike.coderaai.com` points to `156.67.25.212`, not `57.131.19.110`.
- Public inbound `80/443` to `57.131.19.110` times out.
- Trusted custom-domain SSL needs DNS and provider firewall fixed, or a named Cloudflare Tunnel.

## Recommended next work

1. Build a real Frappe custom app for Rakhtety.
2. Move the patched spike code out of the running container and into that app.
3. Add real Frappe user accounts, roles, and permission rules.
4. Keep the Next.js frontend as the Arabic office UI.
5. Replace the temporary Cloudflare Quick Tunnel with a named Cloudflare Tunnel or fix DNS/firewall for Traefik.
6. Run a full restore drill into a clean Frappe site.
7. Only then migrate real production data.

## Migration answer

Run a second productionization spike before full migration.

The backend direction is good. The risky part is not "can Frappe do it?" anymore. The risky part is making it clean, secure, restorable, and maintainable.
