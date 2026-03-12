#!/bin/bash
# Runs prettier on files after Edit/Write operations
INPUT=$(cat)
FILE_PATH=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Only format JS/TS files
case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx|*.json|*.css)
    npx prettier --write "$FILE_PATH" 2>/dev/null
    ;;
esac

exit 0
