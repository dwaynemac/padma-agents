#!/bin/zsh
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CERT_DIR="$ROOT_DIR/certs"
CERT_FILE="$CERT_DIR/local-domains.pem"
KEY_FILE="$CERT_DIR/local-domains-key.pem"
MKCERT_BIN="/usr/local/bin/mkcert"

mkdir -p "$CERT_DIR"

"$MKCERT_BIN" \
  -cert-file "$CERT_FILE" \
  -key-file "$KEY_FILE" \
  __CERT_HOSTS__

echo "Generated:"
echo "  $CERT_FILE"
echo "  $KEY_FILE"
