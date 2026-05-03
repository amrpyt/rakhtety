# Rakhtety Frappe Docker Build

This folder is the first production path for the custom Frappe app.

## Why this exists

Official Frappe Docker supports custom apps through `apps.json` when each app is available as a repository root. Our first version keeps `rakhtety_frappe` inside the main Rakhtety repo, so this build uses a local `COPY` instead.

Later, if `rakhtety_frappe` moves to its own Git repo, switch to the official `apps.json` + layered image flow.

## Build from repo root

```bash
docker build \
  --tag rakhtety-frappe:v16.16.0-dev \
  --file frappe_apps/docker/Containerfile .
```

## Install on a site

After starting containers from this image:

```bash
bench --site <site> install-app rakhtety_frappe
bench --site <site> migrate
```

## Do not do this for production

- Do not edit app files directly inside a running container.
- Do not use one-off SSH patches as the source of truth.
- Do not pass private Git tokens through Docker build args.

For production, the source of truth is Git plus a reproducible image tag.
