## Traefik And SSL Proof

Date: 2026-05-03

## Requested Domain

- Domain: `coderaai.com`
- Planned Frappe spike host: `frappe-spike.coderaai.com`

## DNS Check

Current DNS result:

```text
frappe-spike.coderaai.com -> 156.67.25.212
```

Target server:

```text
57.131.19.110
```

This means the wildcard DNS is not pointing to the Rakhtety spike server yet.

## Traefik Setup

Traefik is installed and running on the server through Docker.

Server paths:

```text
~/rakhtety-spike/traefik/docker-compose.yml
~/rakhtety-spike/traefik/traefik.yml
~/rakhtety-spike/frappe_docker/traefik-frappe.override.yml
~/rakhtety-spike/letsencrypt/acme.json
```

Container:

```text
rakhtety-traefik
```

Ports:

```text
80 -> Traefik web entrypoint
443 -> Traefik websecure entrypoint
```

Configured route:

```text
Host(`frappe-spike.coderaai.com`) -> frappe_docker-frontend-1:8080
```

## Local Traefik Routing Proof

On the server, forcing the host to local Traefik works:

```text
curl -k -I --resolve frappe-spike.coderaai.com:443:127.0.0.1 https://frappe-spike.coderaai.com
```

Result:

```text
HTTP/2 200
X-Page-Name: login
```

This proves Traefik can route to Frappe when the request reaches the server.

## SSL Status

Let's Encrypt certificate issue is blocked for now.

Blockers:

1. `frappe-spike.coderaai.com` points to `156.67.25.212`, not `57.131.19.110`.
2. External tests to `57.131.19.110:80` and `57.131.19.110:443` time out, even though Traefik is listening locally.

Required fix:

```text
Create/update DNS A record:
frappe-spike.coderaai.com -> 57.131.19.110
```

Also allow inbound traffic to the server on:

```text
80/tcp
443/tcp
```

This is probably in the hosting provider firewall/security group, because the server's local UFW is inactive and Docker is listening.

## Browser Use Verification

Used Browser Use headed mode through the in-app browser.

Opened Frappe directly through an SSH tunnel:

```text
http://localhost:8081
```

Result:

- Frappe login page rendered.
- Login with the test `Administrator` account reached `/desk/setup-wizard`.
- Desk page was blank through the tunnel because Frappe socket origin rejected `localhost:8081`.

Opened Rakhtety spike UI through Browser Use:

```text
http://localhost:3010/spikes/frappe
```

Result:

- Page loaded in headed browser.
- It displayed `Test Client One`.
- It displayed `Device License` as `Completed`.
- It displayed `Excavation Permit` as `In Progress`.
- It displayed Arabic workflow step names, finance fields, assignment, and document status from Frappe.

## Current Decision

Traefik is technically working on the server.

Trusted SSL is not complete until DNS points to this server and inbound `80/443` are open from the public internet.
