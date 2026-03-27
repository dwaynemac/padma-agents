# Local HTTPS Domains

This repo provides stable local HTTPS domains for a development app suite.

Replace these placeholders:

- `__BASE_DOMAIN__` with the shared base domain such as `padma.test`
- `__CERT_HOSTS__` with the hostnames to include in the certificate
- `__DNS_ADDRESS_RULE__` with the dnsmasq wildcard rule
- `__SITE_BLOCKS__` with the Caddy site blocks
- `__VERIFY_HOSTS__` with the hosts to check in `scripts/verify.sh`

## One-time setup

```zsh
./scripts/generate-certs.sh
sudo ./scripts/system-install-__PLATFORM__.sh
```

## Normal work session

Start the app processes on their expected ports, then open the configured HTTPS domains.

## Verify

```zsh
./scripts/verify.sh
```
