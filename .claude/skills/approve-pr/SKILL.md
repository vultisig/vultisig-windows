---
name: approve-pr
description: Approve and merge a GitHub PR. Use when you want to approve and merge the current branch's PR, or a specific PR number.
disable-model-invocation: true
---

# Approve and Merge PR

## Usage
`/approve-pr` — approves and merges the PR for the current branch
`/approve-pr 123` — approves and merges PR #123

## Workflow

### 1. Resolve PR Number
If a PR number was passed as argument, use it. Otherwise:
```bash
gh pr view --json number --jq '.number'
```

### 2. Check PR Status
```bash
gh pr view <number> --json title,state,mergeable,statusCheckRollup,reviews
```
- If `state` is not `OPEN`, abort and tell the user.
- If `mergeable` is `CONFLICTING`, abort and tell the user to resolve conflicts first.
- Show a summary of the PR title and any failing checks before proceeding.

### 3. Approve
```bash
gh pr review <number> --approve
```

### 4. Merge (squash by default)
```bash
gh pr merge <number> --squash --auto
```
Use `--auto` so it merges once all required checks pass. If the PR is already mergeable now, it merges immediately.

### 5. Confirm
Print the PR URL and confirm it was approved and queued for merge.

## Rules
- Never merge a PR with `state != OPEN`
- Never force-merge over failing required checks — use `--auto` and let CI decide
- Default merge strategy is squash; do not change this unless the user explicitly asks
- If you cannot approve your own PR (author restriction), tell the user and skip the approve step, then proceed to merge
