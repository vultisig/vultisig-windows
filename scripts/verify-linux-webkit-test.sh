#!/usr/bin/env bash

set -euo pipefail

script_dir=$(cd "$(dirname "$0")" && pwd)
verify_script="$script_dir/verify-linux-webkit.sh"
failed=0

assert_exit() {
  local name="$1"
  local expected="$2"
  local fixture="$3"
  local mock_dir
  mock_dir=$(mktemp -d)
  cat >"$mock_dir/readelf" <<'EOF'
#!/usr/bin/env bash
cat "$MOCK_READELF_OUTPUT"
EOF
  chmod +x "$mock_dir/readelf"

  local fixture_file
  fixture_file=$(mktemp)
  printf '%s\n' "$fixture" >"$fixture_file"

  set +e
  MOCK_READELF_OUTPUT="$fixture_file" PATH="$mock_dir:$PATH" \
    bash "$verify_script" /tmp/fake-linux-elf >/tmp/verify-linux-webkit.out 2>/tmp/verify-linux-webkit.err
  local actual=$?
  set -e

  rm -rf "$mock_dir" "$fixture_file"

  if [[ "$actual" -ne "$expected" ]]; then
    echo "FAIL $name: expected exit $expected, got $actual" >&2
    cat /tmp/verify-linux-webkit.err >&2
    failed=1
    return
  fi

  echo "PASS $name"
}

needed_41=' 0x0000000000000001 (NEEDED)             Shared library: [libwebkit2gtk-4.1.so.0]'
needed_40=' 0x0000000000000001 (NEEDED)             Shared library: [libwebkit2gtk-4.0.so.37]'
runpath_41=' 0x000000000000001d (RUNPATH)            Library runpath: [/opt/libwebkit2gtk-4.1.so.0]'
soname_41=' 0x000000000000000e (SONAME)             Library soname: [libwebkit2gtk-4.1.so.0]'

assert_exit 'accepts DT_NEEDED 4.1' 0 "$needed_41"
assert_exit 'rejects DT_NEEDED 4.0' 1 "$needed_40"
assert_exit 'rejects RUNPATH-only 4.1' 1 "$needed_40
$runpath_41"
assert_exit 'rejects SONAME-only 4.1' 1 "$soname_41"

set +e
bash "$verify_script" >/tmp/verify-linux-webkit.out 2>/tmp/verify-linux-webkit.err
usage_exit=$?
set -e
if [[ "$usage_exit" -ne 2 ]]; then
  echo "FAIL missing-arg: expected exit 2, got $usage_exit" >&2
  failed=1
else
  echo 'PASS missing-arg'
fi

if [[ "$failed" -ne 0 ]]; then
  exit 1
fi
