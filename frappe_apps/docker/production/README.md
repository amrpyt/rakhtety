# Rakhtety Production Docker Deployment

This folder contains the first production deployment template for running the
Rakhtety Frappe backend behind Traefik with HTTPS.

## Preconditions

- DNS for `FRAPPE_HOSTNAME` and `NEXT_HOSTNAME` points to the server IP.
- Server ports `80` and `443` are open to the public internet.
- Docker Engine and Docker Compose are installed.
- The real `.env` file exists on the server and is not committed to Git.
- The image in `RAKHTETY_FRAPPE_IMAGE` includes `rakhtety_frappe`.

## First Run

```bash
cp .env.example .env
# edit .env with real secrets and hostnames

docker compose --env-file .env -f compose.prod.yml build
docker compose --env-file .env -f compose.prod.yml up -d mariadb redis-cache redis-queue traefik
docker compose --env-file .env -f compose.prod.yml run --rm configurator
docker compose --env-file .env -f compose.prod.yml run --rm create-site
docker compose --env-file .env -f compose.prod.yml up -d
```

## Health Checks

```bash
docker compose --env-file .env -f compose.prod.yml ps
docker compose --env-file .env -f compose.prod.yml logs --tail=100 traefik
docker compose --env-file .env -f compose.prod.yml logs --tail=100 backend
docker compose --env-file .env -f compose.prod.yml exec backend bench --site "$SITE_NAME" list-apps
docker compose --env-file .env -f compose.prod.yml exec backend bench --site "$SITE_NAME" doctor
curl -I "https://$FRAPPE_HOSTNAME"
curl -I "https://$NEXT_HOSTNAME"
```

## Backup

```bash
docker compose --env-file .env -f compose.prod.yml exec backend \
  bench --site "$SITE_NAME" backup --with-files
```

Backups are stored under the Frappe site's private backups folder inside the
`sites` volume.

## Rollback Shape

```bash
# 1. Set RAKHTETY_FRAPPE_IMAGE back to the previous known-good tag in .env.
# 2. Restart services.
docker compose --env-file .env -f compose.prod.yml up -d

# 3. Restore the pre-migration backup if data changed.
docker compose --env-file .env -f compose.prod.yml exec backend \
  bench --site "$SITE_NAME" restore /path/to/database.sql.gz --with-public-files /path/to/public-files.tar --with-private-files /path/to/private-files.tar

# 4. Re-run health checks.
docker compose --env-file .env -f compose.prod.yml ps
docker compose --env-file .env -f compose.prod.yml exec backend bench --site "$SITE_NAME" doctor
```

## Notes

- Do not expose MariaDB, Redis, workers, scheduler, or backend ports directly.
- Do not edit application files inside running containers.
- Use Let's Encrypt staging only for repeated certificate debugging, then switch
  back to production ACME before office testing.
