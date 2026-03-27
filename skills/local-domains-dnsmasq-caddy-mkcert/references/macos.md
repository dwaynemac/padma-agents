# macOS

## Goal

Set up trusted local HTTPS domains such as `crm.padma.test` that resolve to local services on `127.0.0.1`.

## Preferred Design

- `dnsmasq` listens on `127.0.0.1:53`
- `/etc/resolver/<tld-or-zone>` points the requested suffix to `127.0.0.1`
- `caddy` listens on `:80` and `:443`
- `mkcert` generates and trusts a local CA and the requested certificates
- `launchd` manages long-running services when persistence is needed

Use this simple design first. Only fall back to a loopback alias if the current macOS build proves resolver overrides against `127.0.0.1` unreliable on this machine.

## Package Install

Use Homebrew if available:

```zsh
brew install dnsmasq caddy mkcert
```

## DNS

Use `dnsmasq` with an explicit config such as:

```conf
no-resolv
no-hosts
keep-in-foreground
listen-address=127.0.0.1
bind-interfaces
port=53
address=/.example.test/127.0.0.1
```

Create `/etc/resolver/test` for `.test` domains:

```text
nameserver 127.0.0.1
```

For a custom zone like `.padma.test`, `/etc/resolver/test` is sufficient because the effective suffix is `.test`. If the user wants a different TLD or suffix, write the matching resolver file.

## Caddy

Prefer a direct `Caddyfile` with one site block per hostname:

```caddy
https://crm.padma.test {
  tls /path/to/cert.pem /path/to/key.pem
  reverse_proxy 127.0.0.1:3000
}
```

Add HTTP-to-HTTPS redirects when helpful.

## Certificates

Generate one certificate that covers:

- base domain
- wildcard domain
- each concrete hostname if needed
- `localhost`, `127.0.0.1`, `::1` when that simplifies testing

Typical command:

```zsh
mkcert -install
mkcert -cert-file cert.pem -key-file key.pem example.test "*.example.test"
```

`mkcert -install` may require interactive elevation or trust-store access.

## Services

For persistent services, prefer `launchd` plists in `/Library/LaunchDaemons` when system-level ports are required. Typical commands:

```zsh
sudo launchctl bootstrap system /Library/LaunchDaemons/com.example.dnsmasq.plist
sudo launchctl bootstrap system /Library/LaunchDaemons/com.example.caddy.plist
sudo launchctl enable system/com.example.dnsmasq
sudo launchctl enable system/com.example.caddy
sudo launchctl kickstart -k system/com.example.dnsmasq
sudo launchctl kickstart -k system/com.example.caddy
```

## Verification

Use:

```zsh
scutil --dns
dig +short crm.padma.test
curl -I https://crm.padma.test
```

If DNS fails:

- verify `/etc/resolver/<zone>` exists
- check `launchctl print system/<label>`
- inspect service logs

If HTTPS fails:

- validate the `Caddyfile`
- confirm the upstream app is listening on the expected port
- confirm the certificate paths are readable by the service user
