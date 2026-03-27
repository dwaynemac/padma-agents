#!/bin/zsh
set -euo pipefail

if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
  echo "Run this script with sudo." >&2
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
RESOLVER_DIR="/etc/resolver"
RESOLVER_FILE="$RESOLVER_DIR/__RESOLVER_ZONE__"
LAUNCH_DAEMONS_DIR="/Library/LaunchDaemons"
DNSMASQ_PLIST="$LAUNCH_DAEMONS_DIR/__DNSMASQ_LABEL__.plist"
CADDY_PLIST="$LAUNCH_DAEMONS_DIR/__CADDY_LABEL__.plist"
MKCERT_BIN="/usr/local/bin/mkcert"

mkdir -p "$RESOLVER_DIR" "$LAUNCH_DAEMONS_DIR" "$ROOT_DIR/log"

"$MKCERT_BIN" -install

install -m 644 /dev/null "$RESOLVER_FILE"
cat > "$RESOLVER_FILE" <<'EOF'
nameserver 127.0.0.1
EOF

install -m 644 /dev/null "$DNSMASQ_PLIST"
cat > "$DNSMASQ_PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>__DNSMASQ_LABEL__</string>
    <key>ProgramArguments</key>
    <array>
      <string>$ROOT_DIR/scripts/start-dnsmasq.sh</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>$ROOT_DIR/log/dnsmasq.log</string>
    <key>StandardErrorPath</key>
    <string>$ROOT_DIR/log/dnsmasq.log</string>
  </dict>
</plist>
EOF

install -m 644 /dev/null "$CADDY_PLIST"
cat > "$CADDY_PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>__CADDY_LABEL__</string>
    <key>ProgramArguments</key>
    <array>
      <string>$ROOT_DIR/scripts/start-caddy.sh</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>$ROOT_DIR/log/caddy.log</string>
    <key>StandardErrorPath</key>
    <string>$ROOT_DIR/log/caddy.log</string>
  </dict>
</plist>
EOF

launchctl bootout system "$DNSMASQ_PLIST" 2>/dev/null || true
launchctl bootout system "$CADDY_PLIST" 2>/dev/null || true
launchctl bootstrap system "$DNSMASQ_PLIST"
launchctl bootstrap system "$CADDY_PLIST"
launchctl enable system/__DNSMASQ_LABEL__
launchctl enable system/__CADDY_LABEL__
launchctl kickstart -k system/__DNSMASQ_LABEL__
launchctl kickstart -k system/__CADDY_LABEL__
