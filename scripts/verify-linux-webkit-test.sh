#!/usr/bin/env bash

set -euo pipefail

script_dir=$(cd "$(dirname "$0")" && pwd)
verify_script="$script_dir/verify-linux-webkit.sh"
failed=0
cleanup_paths=()

cleanup() {
  if [[ ${#cleanup_paths[@]} -gt 0 ]]; then
    rm -rf "${cleanup_paths[@]}"
  fi
}
trap cleanup EXIT

assert_exit() {
  local name="$1"
  local expected="$2"
  local fixture="$3"
  local mock_dir fixture_file stdout_file stderr_file fake_elf

  mock_dir=$(mktemp -d)
  fixture_file=$(mktemp)
  stdout_file=$(mktemp)
  stderr_file=$(mktemp)
  fake_elf=$(mktemp)
  cleanup_paths+=("$mock_dir" "$fixture_file" "$stdout_file" "$stderr_file" "$fake_elf")

  cat >"$mock_dir/readelf" <<'EOF'
#!/usr/bin/env bash
cat "$MOCK_READELF_OUTPUT"
EOF
  chmod +x "$mock_dir/readelf"
  printf '%s\n' "$fixture" >"$fixture_file"

  set +e
  MOCK_READELF_OUTPUT="$fixture_file" PATH="$mock_dir:$PATH" \
    bash "$verify_script" "$fake_elf" >"$stdout_file" 2>"$stderr_file"
  local actual=$?
  set -e

  if [[ "$actual" -ne "$expected" ]]; then
    echo "FAIL $name: expected exit $expected, got $actual" >&2
    cat "$stderr_file" >&2
    failed=1
    return
  fi

  echo "PASS $name"
}

needed_41=' 0x0000000000000001 (NEEDED)             Shared library: [libwebkit2gtk-4.1.so.0]'
needed_40=' 0x0000000000000001 (NEEDED)             Shared library: [libwebkit2gtk-4.0.so.37]'
needed_lookalike=' 0x0000000000000001 (NEEDED)             Shared library: [libwebkit2gtk-4.1.so.0-next]'
needed_regex=' 0x0000000000000001 (NEEDED)             Shared library: [libwebkit2gtk-4X1YsoZ0]'
runpath_41=' 0x000000000000001d (RUNPATH)            Library runpath: [/opt/libwebkit2gtk-4.1.so.0]'
soname_41=' 0x000000000000000e (SONAME)             Library soname: [libwebkit2gtk-4.1.so.0]'

assert_exit 'accepts DT_NEEDED 4.1' 0 "$needed_41"
assert_exit 'rejects DT_NEEDED 4.0' 1 "$needed_40"
assert_exit 'rejects lookalike SONAME' 1 "$needed_lookalike"
assert_exit 'rejects regex-wildcard SONAME' 1 "$needed_regex"
assert_exit 'rejects RUNPATH-only 4.1' 1 "$needed_40
$runpath_41"
assert_exit 'rejects SONAME-only 4.1' 1 "$soname_41"

usage_stdout=$(mktemp)
usage_stderr=$(mktemp)
cleanup_paths+=("$usage_stdout" "$usage_stderr")
set +e
bash "$verify_script" >"$usage_stdout" 2>"$usage_stderr"
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
