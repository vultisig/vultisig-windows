#!/bin/bash
# Sources .envrc on session start so direnv-managed env vars
# (like GH_TOKEN) are available in Claude Code shell sessions.

if [ -z "$CLAUDE_ENV_FILE" ]; then
  exit 0
fi

# Source login profile (Homebrew, etc.)
if [ -f "$HOME/.zprofile" ]; then
  source "$HOME/.zprofile" 2>/dev/null
fi

# Source interactive profile (NVM, custom PATHs, etc.)
if [ -f "$HOME/.zshrc" ]; then
  source "$HOME/.zshrc" 2>/dev/null
fi

# Export the full PATH to Claude's env
echo "export PATH=\"$PATH\"" >> "$CLAUDE_ENV_FILE"

ENVRC_PATH="${CLAUDE_PROJECT_DIR:-.}/.envrc"

if [ -f "$ENVRC_PATH" ]; then
  BEFORE=$(env | sort)
  source "$ENVRC_PATH" 2>/dev/null
  AFTER=$(env | sort)

  diff <(echo "$BEFORE") <(echo "$AFTER") | grep '^>' | sed 's/^> //' >> "$CLAUDE_ENV_FILE"
fi

exit 0
