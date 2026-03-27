#!/bin/zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CADDY_BIN="${CADDY_BIN:-/usr/local/bin/caddy}"
export XDG_DATA_HOME="$ROOT_DIR/.local/share"
export XDG_CONFIG_HOME="$ROOT_DIR/.config"
mkdir -p "$XDG_DATA_HOME" "$XDG_CONFIG_HOME"

exec "$CADDY_BIN" run --config "$ROOT_DIR/config/Caddyfile"
