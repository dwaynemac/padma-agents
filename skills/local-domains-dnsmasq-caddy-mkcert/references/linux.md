# Linux

## Goal

Set up trusted local HTTPS domains such as `crm.padma.test` that resolve to local services on the same machine.

## Preferred Design

- `dnsmasq` listens on `127.0.0.1:53`
- the system resolver sends the target suffix to local `dnsmasq`
- `caddy` listens on `:80` and `:443`
- `mkcert` generates a trusted local CA and the requested certificates
- `systemd` manages persistent services

Adapt the resolver setup to the distro. The two common cases are:

- `systemd-resolved`
- NetworkManager with `dnsmasq` integration disabled or separate

## Package Install

Use the distro package manager. Examples:

Ubuntu or Debian:

```bash
sudo apt-get update
sudo apt-get install -y dnsmasq caddy libnss3-tools
```

Install `mkcert` from the distro packages when available, otherwise from its release artifacts.

Fedora:

```bash
sudo dnf install -y dnsmasq caddy nss-tools mkcert
```

Arch:

```bash
sudo pacman -S dnsmasq caddy nss mkcert
```

## DNS

Use a minimal `dnsmasq` config such as:

```conf
listen-address=127.0.0.1
bind-interfaces
port=53
address=/.example.test/127.0.0.1
```

Resolver wiring depends on the system:

### systemd-resolved

Prefer a drop-in or per-link DNS route that points the target suffix to `127.0.0.1`. On simpler developer workstations, replacing the system nameserver with local `dnsmasq` is acceptable if upstream DNS forwarding is also configured.

Verify with:

```bash
resolvectl status
resolvectl query crm.padma.test
```

### resolv.conf-managed systems

Point `/etc/resolv.conf` at local `dnsmasq` only if you also configure `dnsmasq` to forward non-local names upstream.

## Caddy

Use one site block per hostname:

```caddy
https://crm.padma.test {
  tls /path/to/cert.pem /path/to/key.pem
  reverse_proxy 127.0.0.1:3000
}
```

## Certificates

Use:

```bash
mkcert -install
mkcert -cert-file cert.pem -key-file key.pem example.test "*.example.test"
```

On Linux, trust installation often requires `nss` tools for browsers and root privileges for system CA stores.

## Services

Prefer systemd units when persistence is needed. Typical commands:

```bash
sudo systemctl enable --now dnsmasq
sudo systemctl enable --now caddy
sudo systemctl status dnsmasq
sudo systemctl status caddy
```

If you generate custom unit files, keep them explicit and tied to the repo-local config paths.

## Verification

Use:

```bash
dig +short crm.padma.test
curl -I https://crm.padma.test
```

If DNS fails:

- inspect `resolvectl status` or `/etc/resolv.conf`
- inspect `sudo systemctl status dnsmasq`
- inspect `journalctl -u dnsmasq -u caddy --no-pager`

If HTTPS fails:

- validate the `Caddyfile`
- confirm the upstream app port
- confirm certificate readability
