#!/usr/bin/env bash

set -euo pipefail

WEBKIT_SONAME='libwebkit2gtk-4.1.so.0'

if [[ $# -lt 1 || -z "${1:-}" ]]; then
  echo "usage: $0 <linux-elf>" >&2
  exit 2
fi

binary_path="$1"
needed=$(readelf --dynamic "$binary_path" | grep -E '\(NEEDED\)' || true)

if grep --fixed-strings --quiet "[${WEBKIT_SONAME}]" <<<"$needed"; then
  exit 0
fi

echo "Linux build must link ${WEBKIT_SONAME}. Pass -tags webkit2_41 on Ubuntu 24.04 / Debian 13." >&2
exit 1
