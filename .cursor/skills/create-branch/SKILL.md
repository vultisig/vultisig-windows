---
name: create-branch
description: Create a new git branch from conversation context. Use when starting work on a GitHub issue or new feature and need to create a branch.
---

# Create Branch

Create a new local git branch based on conversation context.

## Branch Naming

1. **GitHub issue in context** (URL or #123 reference):
   - Format: `{issue-number}-{slugified-issue-title}`
   - Example: Issue #42 "Fix TRC20 token transfers" -> `42-fix-trc20-token-transfers`

2. **No GitHub issue**:
   - Create a descriptive branch name based on what we're working on
   - Format: `{short-description}`
   - Example: Adding dark mode -> `add-dark-mode`

## Rules

- Lowercase with hyphens
- Max 50 characters for description
- Local only (no push)
- Use `git checkout -b <branch-name>`
