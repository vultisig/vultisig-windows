---
name: create-branch
description: Create a new git branch from conversation context. Use when starting work on a GitHub issue or new feature and need to create a branch.
---

# Create Branch

Create a new local git branch based on conversation context.

## Branch Naming

1. **GitHub issue in context** (URL or #123 reference):
   - **Full issue completed:** Use `{issue-number}-{slugified-issue-title}`.
     Example: Issue #42 "Fix TRC20 token transfers" -> `42-fix-trc20-token-transfers`
   - **Only part of the task or work-in-progress:** Do not include the issue number. Use a descriptive name in kebab-case (same format as "No GitHub issue" below).
     Example: Adding one component from a larger issue -> `add-transaction-history-tag`

2. **No GitHub issue**:
   - Create a descriptive branch name based on what we're working on
   - Format: `{short-description}` in kebab-case, no prefixes like `feat/`, `fix/`, etc.
   - Example: Adding dark mode -> `add-dark-mode`

## Rules

- Only include the issue number in the branch name when the work completes the full scope of that issue.
- Lowercase with hyphens
- Max 50 characters for description
- Local only (no push)
- Use `git checkout -b <branch-name>`
