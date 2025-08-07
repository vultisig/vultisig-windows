#!/usr/bin/env bash
set -euo pipefail

COMMONDATA_REPO=https://github.com/vultisig/commondata.git
TEMP_DIR=$(mktemp -d)
ROOT_DIR="$(git rev-parse --show-toplevel)"

echo "⏬  Cloning commondata…"
git clone --depth 1 "$COMMONDATA_REPO" "$TEMP_DIR"

echo "🔄  Syncing proto sources…"
mkdir -p "$ROOT_DIR/commondata/proto"
rsync -a --delete "$TEMP_DIR/proto/" "$ROOT_DIR/commondata/proto/"

echo "🛠  buf generate…"
( cd "$ROOT_DIR" && buf generate )      

echo "🎨  yarn format (optional)…"
yarn format:types || true

rm -rf "$TEMP_DIR"
echo "✅  Proto synced & code generated"
