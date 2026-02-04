---
name: resolve-pr-comments
description: Address CodeRabbit (or other AI reviewer) comments on a pull request to make it merge-ready.
disable-model-invocation: true
---

# Resolve PR Review Comments

Address CodeRabbit (or other AI reviewer) comments on a pull request to make it merge-ready.

## Usage

Provide the PR link or number. The agent will:

1. Fetch all unresolved review comments
2. Critically evaluate each suggestion before implementing
3. Push changes and resolve all conversations

## Workflow

### 1. Fetch Review Comments

Use GitHub MCP to get all review threads:

```
pull_request_read with method: "get_review_comments"
```

Focus on threads where `IsResolved: false`.

### 2. Evaluate Each Comment Critically

AI reviewers (CodeRabbit, etc.) can be wrong. Before implementing any suggestion:

- **Verify the claim**: Does the code actually have the issue described? Check actual behavior, not just static analysis.
- **Question "critical" or "major" labels**: These are often overstated. A real critical bug would likely have been caught during development.
- **Check if current code works**: If functionality works correctly, the suggestion may be based on misunderstanding.
- **Ask the user** if a suggestion seems questionable or would require significant changes.

### 3. Address Valid Comments

For comments that are actually valid:

- Implement the fix
- Group related changes efficiently

Skip invalid suggestions - no need to explain why to an AI reviewer.

### 4. Run Checks

```bash
yarn check
```

Fix any errors before proceeding.

### 5. Push and Resolve

```bash
git add -A && git commit -m "address review comments" && git push
yarn tsx .cursor/skills/resolve-pr-comments/scripts/resolve-pr-comments.ts <PR_NUMBER>
```

## Goal

- All review threads resolved
- All checks pass
- PR ready to merge
