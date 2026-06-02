#!/usr/bin/env bash
set -euo pipefail

# Navigate to the project root directory
cd "$(dirname "$0")/../../../.." || exit

# Report duplicate English source text values. This is advisory because short
# UI labels can repeat intentionally.
npx tsx core/ui/i18n/scripts/find-duplicates.ts "$@"
