## Server Discovery

Date: 2026-05-03

## Login Method

- SSH host: `57.131.19.110`
- Working SSH user: `ubuntu`
- Provided `amr` username did not accept the provided key.
- Password login is disabled; server allows `publickey` authentication only.
- The local key file required tighter Windows permissions before SSH would read it.
- Do not commit key files, passwords, or server secrets.

## Server Facts

- OS: Ubuntu 25.04 (Plucky Puffin)
- Kernel: Linux 6.14.0-34-generic
- CPU: 4 vCPU, AMD EPYC-Milan
- Memory: 15 GiB total, about 14 GiB available during inspection
- Swap: none
- Disk: `/dev/sda1`, 96 GiB total, about 87 GiB free
- Sudo: passwordless sudo works for `ubuntu`

## Open Ports And Existing Services

- SSH: port `22`
- Existing Node service: port `5173`
- Existing Node service: port `3001`
- Tailscale is running.
- No HTTP/HTTPS service was listening on ports `80` or `443` during discovery.

## Tooling State

Installed:
- `apt`
- `python3`
- `git`
- `curl`

Missing or not on PATH:
- `docker`
- `docker-compose`
- `node`
- `npm`
- `pnpm`
- `nginx`
- `caddy`
- `mariadb`
- `mysql`
- `redis-server`

## Deployment Choice

Use Docker for the spike.

Reason: official Frappe guidance recommends `frappe_docker` for production-style or Docker-based deployments, and this server has enough CPU/RAM/disk for a Docker spike. Docker also keeps MariaDB, Redis, workers, and Frappe isolated from the two existing Node services already running on the server.

Do not use bare-metal Bench first.

Reason: bare-metal Bench would install MariaDB, Redis, Node, Python tooling, and system packages directly onto Ubuntu 25.04. That is more invasive and more likely to clash with existing services. Docker is a cleaner small experiment.

## Current Blockers

- No domain was provided yet, so HTTPS can be planned but not completed with a real certificate unless a domain is added.
- Ports `5173` and `3001` are already used; the spike should avoid them.
- Docker must be installed before the Frappe test site can run.
