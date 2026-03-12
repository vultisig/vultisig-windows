#!/bin/bash
# Sync sibling repos (vultisig-ios, vultisig-android, VultiServer)
# Non-blocking: runs in background, reports updates
# Invoked at SessionStart

set -e

REPO_ROOT="/sessions/blissful-zen-johnson/mnt/T_R"
SIBLING_REPOS=(
  "vultisig-ios"
  "vultisig-android"
  "VultiServer"
)

sync_repo() {
  local repo_path="$REPO_ROOT/$1"
  local repo_name="$1"

  if [ ! -d "$repo_path" ]; then
    echo "[sync-platform-repos] ⊘ $repo_name not found at $repo_path"
    return 0
  fi

  # Try fast-forward pull (non-blocking, quiet)
  if git -C "$repo_path" pull --ff-only --quiet 2>/dev/null; then
    # Check if there were updates
    local latest_commit=$(git -C "$repo_path" rev-parse --short HEAD)
    echo "[sync-platform-repos] ✓ $repo_name updated to $latest_commit"
  else
    # Either already up-to-date or merge conflict (we don't attempt merge)
    # Silent on up-to-date, warn on conflict
    if git -C "$repo_path" status --porcelain | grep -q .; then
      echo "[sync-platform-repos] ⚠ $repo_name has local changes, skipping pull"
    else
      echo "[sync-platform-repos] ✓ $repo_name already up-to-date"
    fi
  fi
}

# Sync all sibling repos in parallel (non-blocking)
for repo in "${SIBLING_REPOS[@]}"; do
  sync_repo "$repo" &
done

# Wait for all background syncs to complete
wait

echo "[sync-platform-repos] Complete"
