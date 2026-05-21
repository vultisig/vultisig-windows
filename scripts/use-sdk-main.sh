#!/usr/bin/env bash
# Clone vultisig-sdk main and apply the same local tarball override used by CI.
set -euo pipefail

WINDOWS_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SDK_REPO_URL="${SDK_REPO_URL:-https://github.com/vultisig/vultisig-sdk.git}"
SDK_REF="${SDK_REF:-main}"
SDK_CLONE_DIR="${SDK_CLONE_DIR:-$(mktemp -d "${TMPDIR:-/tmp}/vultisig-sdk-main.XXXXXX")}"

if [ -d "$SDK_CLONE_DIR/.git" ]; then
  echo "==> Using existing SDK checkout at $SDK_CLONE_DIR"
  git -C "$SDK_CLONE_DIR" fetch --depth 1 origin "$SDK_REF"
  git -C "$SDK_CLONE_DIR" checkout --detach FETCH_HEAD
else
  echo "==> Cloning SDK $SDK_REF from $SDK_REPO_URL"
  git clone --depth 1 --branch "$SDK_REF" "$SDK_REPO_URL" "$SDK_CLONE_DIR"
fi

bash "$WINDOWS_DIR/scripts/use-local-sdk.sh" "$SDK_CLONE_DIR"

echo ""
echo "Local dependencies now match CI's SDK-main override."
echo "Run: yarn dev:desktop"
