#!/bin/bash
# TaskCompleted hook: verify lint + typecheck pass before task completion
# Exit 2 to block, exit 0 to allow

cd "$CLAUDE_PROJECT_DIR" || exit 0

# Check for any modified TS/TSX files
MODIFIED=$(git diff --name-only --diff-filter=ACMR HEAD 2>/dev/null | grep -E '\.(ts|tsx)$' || true)

if [ -z "$MODIFIED" ]; then
  exit 0
fi

# Run lint check
if ! yarn lint 2>/dev/null; then
  echo "Quality gate: ESLint violations found in modified files" >&2
  exit 2
fi

# Run typecheck
if ! yarn typecheck 2>/dev/null; then
  echo "Quality gate: TypeScript errors found" >&2
  exit 2
fi

exit 0
