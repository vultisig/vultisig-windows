#!/usr/bin/env bash

set -euo pipefail

binary_path="$1"
dependencies=$(readelf --dynamic "$binary_path")

if grep --fixed-strings --quiet 'libwebkit2gtk-4.1.so.0' <<<"$dependencies"; then
  exit 0
fi

echo 'Linux build must use WebKitGTK 4.1. Check build:tags in wails.json.' >&2
exit 1
