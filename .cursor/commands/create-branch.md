Create a new local git branch based on the conversation context.

## Branch Naming

1. **If a GitHub issue was mentioned** (URL like `github.com/.../issues/123` or reference like `#123`):
   - Use the format: `{issue-number}-{slugified-issue-title}`
   - Example: Issue #42 "Fix TRC20 token transfers" → `42-fix-trc20-token-transfers`

2. **If no GitHub issue in context**:
   - Create a descriptive branch name based on what we're working on
   - Use format: `{type}/{short-description}` where type is `feature`, `fix`, `refactor`, etc.
   - Example: Adding dark mode → `feature/add-dark-mode`

## Rules

- Keep branch names lowercase with hyphens
- Maximum 50 characters for the description part
- Only create the branch locally (no push)
- Use `git checkout -b <branch-name>` to create and switch to the branch
