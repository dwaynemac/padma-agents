---
name: local-domains-dnsmasq-caddy-mkcert
description: Set up stable local HTTPS development domains with dnsmasq, caddy, and mkcert on macOS or Linux. Use when Codex needs to map friendly hostnames like app.test or suite.example.test to local app ports, install or update local DNS and reverse-proxy configuration, generate trusted certificates, or troubleshoot why local custom domains are not resolving or proxying correctly.
---

# Local HTTPS Domains

Set up local development domains with the smallest reliable configuration for the current machine.

Prefer:

- `dnsmasq` for wildcard DNS
- `caddy` for HTTP and HTTPS reverse proxy
- `mkcert` for local trusted certificates

Keep the setup explicit and repo-local when possible. Put machine-wide pieces in system config only when required for DNS resolution, trusted certificates, or privileged ports.

## Workflow

1. Confirm the requested domains and upstream local ports.
2. Detect the platform.
3. Read the matching reference:
   - macOS: [references/macos.md](references/macos.md)
   - Linux: [references/linux.md](references/linux.md)
4. Install missing packages.
5. Generate certificates for the requested hostnames.
6. Create or update:
   - `dnsmasq` config
   - `Caddyfile`
   - startup scripts or service definitions
   - a verification script
7. Validate the config before claiming success.
8. Run or instruct the final privileged install step if the machine requires interactive elevation.

## Implementation Rules

- Prefer `127.0.0.1` for scoped local DNS when the platform reliably supports `/etc/resolver` or equivalent against localhost on port `53`.
- Do not introduce a loopback alias unless platform behavior or resolver limitations force it.
- Keep app-to-port mappings obvious in the generated config.
- Prefer one shared certificate covering the base domain and wildcard, unless the user asks for isolated certificates.
- Keep long-running services unprivileged where possible, but accept system services when binding to port `53`, `80`, or `443` is the cleanest option.
- Validate both `dnsmasq` and `caddy` config syntax before finishing.
- Add a small verification command or script that checks both DNS resolution and HTTPS reachability.

## Validation

Always verify with the local machine after changes:

- DNS:
  - `dig +short <host>`
  - or platform-specific resolver inspection from the reference
- HTTP/S:
  - `curl -I https://<host>`
- Config:
  - `dnsmasq --test ...`
  - `caddy validate --config ...`

If validation fails, inspect the active service status and logs before changing the design.

## Outputs

Produce:

- the config files
- the install or bootstrap commands
- the verification commands
- any manual privileged step the user must run locally

Keep the final explanation short and operational.
