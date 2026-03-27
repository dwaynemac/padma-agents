#!/bin/bash
set -euo pipefail

if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
  echo "Run this script with sudo." >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
MKCERT_BIN="${MKCERT_BIN:-mkcert}"
SYSTEMD_DIR="/etc/systemd/system"
DNSMASQ_UNIT="$SYSTEMD_DIR/__DNSMASQ_LABEL__.service"
CADDY_UNIT="$SYSTEMD_DIR/__CADDY_LABEL__.service"

"$MKCERT_BIN" -install

install -m 644 /dev/null "$DNSMASQ_UNIT"
cat > "$DNSMASQ_UNIT" <<EOF
[Unit]
Description=__DNSMASQ_LABEL__
After=network.target

[Service]
ExecStart=$ROOT_DIR/scripts/start-dnsmasq.sh
Restart=always

[Install]
WantedBy=multi-user.target
EOF

install -m 644 /dev/null "$CADDY_UNIT"
cat > "$CADDY_UNIT" <<EOF
[Unit]
Description=__CADDY_LABEL__
After=network.target

[Service]
ExecStart=$ROOT_DIR/scripts/start-caddy.sh
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now "__DNSMASQ_LABEL__.service"
systemctl enable --now "__CADDY_LABEL__.service"
