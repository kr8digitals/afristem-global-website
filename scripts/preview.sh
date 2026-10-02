#!/usr/bin/env bash
# Rebuild-if-needed and serve the site on 0.0.0.0:3000 for the live preview panel.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -d node_modules ]; then
  echo "▸ installing dependencies…"
  npm ci --no-audit --no-fund
fi

if [ ! -f .next/BUILD_ID ]; then
  echo "▸ building…"
  NODE_OPTIONS="--max-old-space-size=3072" npx next build
fi

echo "▸ starting on :3000"
exec npx next start -H 0.0.0.0 -p 3000
