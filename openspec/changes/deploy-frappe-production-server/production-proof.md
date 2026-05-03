# Production Proof

## Local Image Build Proof

Checked: 2026-05-04 Africa/Cairo

Built local production image:

```bash
docker build -t rakhtety-frappe:v16.16.0-prod -f frappe_apps/docker/Containerfile .
```

Image inspection:

```text
sha256:989207e7029281e520fc61467bc99d0207bae106dd7014f79360b5ccf26e1645 [rakhtety-frappe:v16.16.0-prod] 730324511
```

Custom app presence check:

```bash
docker run --rm rakhtety-frappe:v16.16.0-prod bash -lc "test -d /home/frappe/frappe-bench/apps/rakhtety_frappe && grep -qxF rakhtety_frappe /home/frappe/frappe-bench/sites/apps.txt && echo rakhtety_frappe_present"
```

Result:

```text
rakhtety_frappe_present
```

## Current Production Blockers

- SSH to `amr@57.131.19.110` still fails with `Permission denied (publickey)`.
- `rakhtety.coderaai.com` and `frappe-rakhtety.coderaai.com` still point to `156.67.25.212`, not `57.131.19.110`.
- Public `80` and `443` on `57.131.19.110` are not reachable from this machine.

## Rollback Commands

Use these only after SSH access and production deployment are active.

Set the previous image tag:

```bash
cd /opt/rakhtety
cp .env .env.rollback.$(date +%Y%m%d%H%M%S)
sed -i 's/^RAKHTETY_FRAPPE_IMAGE=.*/RAKHTETY_FRAPPE_IMAGE=<previous-frappe-image-tag>/' .env
sed -i 's/^RAKHTETY_NEXT_IMAGE=.*/RAKHTETY_NEXT_IMAGE=<previous-next-image-tag>/' .env
docker compose -f compose.prod.yml pull || true
docker compose -f compose.prod.yml up -d backend frontend websocket scheduler queue-short queue-long next
```

Restore a pre-migration Frappe backup:

```bash
cd /opt/rakhtety
docker compose -f compose.prod.yml exec backend bench --site "$SITE_NAME" --force restore /home/frappe/frappe-bench/sites/$SITE_NAME/private/backups/<database-backup>.sql.gz --with-private-files /home/frappe/frappe-bench/sites/$SITE_NAME/private/backups/<private-files>.tar --with-public-files /home/frappe/frappe-bench/sites/$SITE_NAME/private/backups/<public-files>.tar
docker compose -f compose.prod.yml exec backend bench --site "$SITE_NAME" migrate
docker compose -f compose.prod.yml restart backend frontend websocket scheduler queue-short queue-long next
```

Post-rollback smoke:

```bash
docker compose -f compose.prod.yml ps
curl -I "https://$FRAPPE_HOSTNAME"
curl -I "https://$NEXT_HOSTNAME"
docker compose -f compose.prod.yml exec backend bench --site "$SITE_NAME" list-apps
```
