#!/bin/zsh
set -euo pipefail

hosts=(
__VERIFY_HOSTS__
)

echo "DNS"
for host in "${hosts[@]}"; do
  printf '%s -> ' "$host"
  dig +short "$host" | tail -n 1
done

echo
echo "HTTPS"
for host in "${hosts[@]}"; do
  echo "== $host =="
  curl -sSI "https://$host" | sed -n '1,5p'
  echo
done
