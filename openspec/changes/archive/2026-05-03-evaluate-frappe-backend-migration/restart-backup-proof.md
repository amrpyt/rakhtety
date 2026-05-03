# Restart and Backup Proof

Timestamp: 2026-05-03 17:52 +03:00

## Service restart proof

Server: `57.131.19.110`
SSH user used: `ubuntu`
Frappe stack path: `~/rakhtety-spike/frappe_docker`

Command run:

```bash
sudo docker compose -f pwd.yml -f traefik-frappe.override.yml restart backend frontend queue-short queue-long scheduler websocket
```

Result:

- Frappe backend restarted.
- Frappe frontend restarted.
- Queue workers restarted.
- Scheduler restarted.
- Websocket restarted.
- Local Frappe HTTP check returned `200`.
- Cloudflare tunnel container `rakhtety-cloudflared` stayed running.

This proves the test Frappe site survives a normal service restart. A full server reboot was not run because that would interrupt the active spike server.

## Backup proof

Command run inside the Frappe backend container:

```bash
bench --site frontend backup --with-files
```

Result:

- Backup completed successfully.
- Database backup:
  `/home/frappe/frappe-bench/sites/frontend/private/backups/20260503_202146-frontend-database.sql.gz`
- Site config backup:
  `/home/frappe/frappe-bench/sites/frontend/private/backups/20260503_202146-frontend-site_config_backup.json`
- Public file backup:
  `/home/frappe/frappe-bench/sites/frontend/private/backups/20260503_202146-frontend-files.tar`
- Private file backup:
  `/home/frappe/frappe-bench/sites/frontend/private/backups/20260503_202146-frontend-private-files.tar`

## Restore smoke test

Low-risk smoke checks run:

```bash
gzip -t 20260503_202146-frontend-database.sql.gz
tar -tf 20260503_202146-frontend-files.tar
tar -tf 20260503_202146-frontend-private-files.tar
bench --site frontend restore --help
```

Result:

- Database archive passed gzip integrity check.
- Public files tarball was readable.
- Private files tarball was readable.
- Frappe restore command supports database restore plus public/private files.

Restore command shape:

```bash
bench --site <target-site> restore sites/frontend/private/backups/20260503_202146-frontend-database.sql.gz \
  --db-root-username root \
  --db-root-password <mariadb-root-password> \
  --with-public-files sites/frontend/private/backups/20260503_202146-frontend-files.tar \
  --with-private-files sites/frontend/private/backups/20260503_202146-frontend-private-files.tar \
  --force
```

Important limit: this is an integrity smoke test, not a full production restore drill. A proper restore drill should restore into a separate clean Frappe site after the spike code becomes a real Frappe custom app. The current backend logic is patched directly into the running Frappe container, so restoring into a clean site would not be a trustworthy production rehearsal yet.

## Retention assumption

For a real office deployment:

- Run daily backups.
- Keep 7 daily backups.
- Keep 4 weekly backups.
- Copy backups off the server, not only inside the Docker volume.
- Test a full restore before calling the system production-ready.
