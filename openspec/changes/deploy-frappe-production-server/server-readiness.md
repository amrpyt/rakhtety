# Server Readiness

Checked: 2026-05-04 02:3x Africa/Cairo

## Target

- Server IP: `57.131.19.110`
- Intended Frappe hostname candidate: `frappe-rakhtety.coderaai.com`
- Intended frontend hostname candidate: `rakhtety.coderaai.com`

## Network Findings

- SSH port `22` is reachable from this machine.
- Port `80` did not respond from this machine.
- Port `443` did not respond from this machine.
- `rakhtety.coderaai.com` currently resolves to `156.67.25.212`, not `57.131.19.110`.
- `frappe-rakhtety.coderaai.com` currently resolves to `156.67.25.212`, not `57.131.19.110`.

Rechecked on 2026-05-04:

- `rakhtety.coderaai.com` still resolves to `156.67.25.212`.
- `frappe-rakhtety.coderaai.com` still resolves to `156.67.25.212`.
- `57.131.19.110:22` is reachable.
- `57.131.19.110:80` failed TCP connect.
- `57.131.19.110:443` failed TCP connect / timed out.

## SSH Findings

- `amr@57.131.19.110` failed with `Permission denied (publickey)`.
- `ubuntu@57.131.19.110` failed with `Permission denied (publickey)`.
- `root@57.131.19.110` failed with `Permission denied (publickey)`.
- `amr@57.131.19.110 whoami` rechecked on 2026-05-04 and still failed with `Permission denied (publickey)`.
- Local keys tried:
  - `$HOME\.ssh\vps_key`
  - `$HOME\.ssh\id_amr`
  - `$HOME\.ssh\id_ed25519`
- None of the local keys were accepted.

## Current Blockers

1. SSH access is key-only, and this machine's keys are not authorized on the server.
2. DNS for the candidate hostnames does not point to the target server IP.
3. Ports `80` and `443` are not currently reachable from this machine, so Traefik cannot complete Let's Encrypt HTTP-01 until routing/firewall is fixed.

## Required Next Access Step

Add this machine's public SSH key to the server user's `~/.ssh/authorized_keys`, or provide the private key already authorized for the server.

After SSH works, run:

```bash
whoami
hostnamectl
docker --version
docker compose version
df -h
free -h
ss -tulpn
sudo ufw status verbose || true
docker ps
```
