## Cloudflare Quick Tunnel Proof

Date: 2026-05-03

## Why This Was Tried

Public traffic to `57.131.19.110:80` and `57.131.19.110:443` timed out from outside the server. That blocks normal Traefik + Let's Encrypt access, even though Traefik works locally on the server.

Cloudflare Quick Tunnel avoids that by making an outbound connection from the server to Cloudflare. No inbound server ports are needed.

## Tunnel Setup

Container:

```text
rakhtety-cloudflared
```

Command used on the server:

```text
docker run -d \
  --name rakhtety-cloudflared \
  --restart unless-stopped \
  --network host \
  cloudflare/cloudflared:latest \
  tunnel --no-autoupdate --url http://127.0.0.1:8080
```

Cloudflare generated this temporary HTTPS URL:

```text
https://era-earrings-finest-casio.trycloudflare.com
```

## Proof

External HTTP check:

```text
GET https://era-earrings-finest-casio.trycloudflare.com
```

Result:

```text
HTTP 200
Login to Frappe page found
```

External Frappe login API check:

```text
POST https://era-earrings-finest-casio.trycloudflare.com/api/method/login
```

Result:

```json
{"message":"Logged In","home_page":"desk","full_name":"Administrator"}
```

## Browser Use Status

Browser Use was requested for headed verification. The Browser Use runtime failed to start its local app-server with:

```text
The system cannot find the path specified.
```

The tunnel itself is still proven by external HTTPS checks. Headed Browser Use verification should be retried after the in-app browser runtime is healthy again.

## Notes

- This is a free temporary `trycloudflare.com` tunnel.
- Cloudflare states quick tunnels have no uptime guarantee and are for experiments/testing.
- For production, use a named Cloudflare Tunnel attached to the user's Cloudflare account and a stable hostname.
- This path solves the current provider firewall issue because it needs outbound connectivity only.
