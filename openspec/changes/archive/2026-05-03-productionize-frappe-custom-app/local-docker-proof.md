# Local Docker Proof

Timestamp: 2026-05-03

## Image build

Built local image:

```bash
docker build --tag rakhtety-frappe:v16.16.0-dev --file frappe_apps/docker/Containerfile .
```

Proof:

- Image built successfully.
- `rakhtety_frappe` was installed with pip inside the image.
- `sites/apps.txt` contains:
  - `frappe`
  - `erpnext`
  - `rakhtety_frappe`
- Python import check returned version `0.0.1`.

## Clean install

Started clean local Docker test services:

- `rakhtety-test-db`
- `rakhtety-test-redis-cache`
- `rakhtety-test-redis-queue`

Created clean Frappe site from the custom image and installed `rakhtety_frappe`.

Proof:

```text
frappe          16.17.0
rakhtety_frappe 0.0.1
```

## Frappe tests

Ran:

```bash
bench --site rakhtety-tests2.localhost run-tests --app rakhtety_frappe --failfast
```

Result:

- 5 integration tests passed.
- Covered DocTypes, Excavation dependency, required document gate, assigned-work visibility, and API writes.

## Local Browser Use verification

Started local Frappe web server:

```bash
bench serve --port 8000 --noreload --nothreading
```

Exposed through Docker as:

```text
http://localhost:8088
```

Restarted Next.js dev server on:

```text
http://localhost:3010
```

With:

- `FRAPPE_BASE_URL=http://localhost:8088`
- `FRAPPE_USERNAME=Administrator`
- `FRAPPE_PASSWORD=admin`
- `FRAPPE_SPIKE_LOCAL_URL=http://localhost:3010`

Browser Use verified:

- Frontend reads `Local Client` from `rakhtety_frappe.api.get_client_workflow`.
- Starting Excavation before completion shows the expected locked error.
- Upload required document works.
- Completing steps works.
- After Device License completion, Excavation Permit starts and appears as `In Progress`.
- `Local Employee` sees `Local Client` work and does not see `Other Client`.
- `Other Employee` sees `Other Client` work and does not see `Local Client`.

## Backup and restore

Created backup:

```bash
bench --site rakhtety-live.localhost backup --with-files
```

Backup files:

- `20260503_210138-rakhtety-live_localhost-database.sql.gz`
- `20260503_210138-rakhtety-live_localhost-files.tar`
- `20260503_210138-rakhtety-live_localhost-private-files.tar`
- `20260503_210138-rakhtety-live_localhost-site_config_backup.json`

Restored into clean target site:

```text
rakhtety-restore.localhost
```

Restore result:

- Restore completed with files.
- Restored site could read `Local Client`.
- Restored site returned `Device License`.
- Restored workflow status was `Completed`.

## Notes

- The local web server is a development server, not production.
- Production still needs image push/pull, server Compose wiring, named tunnel or fixed DNS/firewall, and production backup retention.
