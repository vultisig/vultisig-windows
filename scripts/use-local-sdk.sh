#!/usr/bin/env bash
# Override @vultisig/* packages with locally built SDK tarballs.
# Usage: ./scripts/use-local-sdk.sh /path/to/vultisig-sdk
# To restore: git checkout package.json yarn.lock && yarn install
set -euo pipefail

SDK_DIR="${1:?Usage: $0 /path/to/vultisig-sdk}"
SDK_DIR="$(cd "$SDK_DIR" && pwd)"
WINDOWS_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PACK_DIR="$(mktemp -d)"

SHARED_PACKAGES=(
  packages/sdk
  packages/core/chain
  packages/core/config
  packages/core/mpc
  packages/lib/utils
  packages/mpc-types
  packages/mpc-wasm
)

echo "==> Building SDK at $SDK_DIR"
cd "$SDK_DIR"
yarn install
yarn build:shared
yarn build:all

echo "==> Packing SDK packages to $PACK_DIR"
for dir in "${SHARED_PACKAGES[@]}"; do
  cd "$SDK_DIR/$dir" && npm pack --pack-destination "$PACK_DIR" 2>/dev/null
done

echo "==> Adding resolutions to package.json"
cd "$WINDOWS_DIR"
PACK_DIR="$PACK_DIR" node - <<'NODE'
  const fs = require('fs');
  const path = require('path');
  const { execFileSync } = require('child_process');
  const packDir = process.env.PACK_DIR;
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const packs = fs.readdirSync(packDir).filter(f => f.endsWith('.tgz'));
  const resolutions = pkg.resolutions || {};
  const dependencies = pkg.dependencies || {};
  const NEW_ROOT_DEPS = new Set([
    '@vultisig/mpc-types',
    '@vultisig/mpc-wasm',
  ]);
  for (const tgz of packs) {
    const tgzPath = path.join(packDir, tgz);
    const manifest = execFileSync(
      'tar',
      ['-xzf', tgzPath, '-O', 'package/package.json'],
      { encoding: 'utf8' }
    );
    const name = JSON.parse(manifest).name;
    resolutions[name] = tgzPath;
    if (NEW_ROOT_DEPS.has(name)) {
      dependencies[name] = tgzPath;
    }
  }
  pkg.resolutions = resolutions;
  pkg.dependencies = dependencies;
  fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
NODE

echo "==> Installing with SDK overrides"
yarn install

echo ""
echo "Done! All @vultisig/* packages now point to SDK main."
echo "To restore: git checkout package.json yarn.lock && yarn install"
