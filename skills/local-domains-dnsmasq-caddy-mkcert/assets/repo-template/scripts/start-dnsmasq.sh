#!/bin/zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DNSMASQ_BIN="${DNSMASQ_BIN:-/usr/local/opt/dnsmasq/sbin/dnsmasq}"

exec "$DNSMASQ_BIN" --conf-file="$ROOT_DIR/config/dnsmasq.conf"
