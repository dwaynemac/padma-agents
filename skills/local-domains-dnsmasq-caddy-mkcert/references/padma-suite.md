# Padma Suite

This file is the source of truth for Padma local-domain routing in this skill.

## Domains

- `https://crm.padma.test` -> `http://127.0.0.1:3000`
- `https://accounts.padma.test` -> `http://127.0.0.1:3001`
- `https://learn.padma.test` -> `http://127.0.0.1:3031`
- `https://money.padma.test` -> `http://127.0.0.1:3032`

## Notes

- When generating `dnsmasq` config, use a wildcard rule for `.padma.test`.
- When generating `Caddyfile` site blocks, use these four hostnames unless the user explicitly asks to add or remove one.
- When generating verification scripts, check these same four hostnames.
- If the suite changes in the future, update this file first and then propagate the new mapping into generated config.
