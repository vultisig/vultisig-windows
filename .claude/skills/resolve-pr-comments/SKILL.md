---
name: resolve-pr-comments
description: Address CodeRabbit or other reviewer comments on a PR to make it merge-ready.
disable-model-invocation: true
---

# Resolve PR Review Comments

## Usage
Provide the PR link or number.

## Workflow

### 1. Fetch Review Comments
List the unresolved review comments and capture each comment's `id` (you need it to reply
in-thread). Take comments where `in_reply_to_id == null` — those are the thread roots.

```bash
gh api repos/{owner}/{repo}/pulls/<PR>/comments --paginate \
  --jq '.[] | select(.in_reply_to_id == null) | {id, path, line, user: .user.login, body}'
```

### 2. Evaluate Critically
Reviewers (human or AI) can be wrong. Before implementing:
- **Verify the claim** — does the code actually have the issue?
- **Question severity** — "critical" labels are often overstated
- **Check if code works** — suggestion may be based on misunderstanding
- **Ask the user** for questionable or significant changes

### 3. Address Valid Comments
Implement fixes. Skip invalid suggestions.

### 4. Run Checks
```bash
yarn check
```

### 5. Reply In-Thread to Each Comment

This applies to **all reviewers** — CodeRabbit and humans alike.

Reply to the **specific review comment**, in its thread, using the comment `id` from step 1.
Either of these endpoints keeps the reply attached to the thread:

```bash
# Preferred: dedicated reply endpoint
gh api --method POST repos/{owner}/{repo}/pulls/<PR>/comments/<COMMENT_ID>/replies \
  -f body='Fixed in <commit_sha> — <what changed>.'

# Equivalent: in_reply_to on the create-comment endpoint
gh api --method POST repos/{owner}/{repo}/pulls/<PR>/comments \
  -f body='Fixed in <commit_sha> — <what changed>.' -F in_reply_to=<COMMENT_ID>
```

**Never** reply with `gh pr comment` (or any top-level / issue comment) for review feedback.
A top-level comment is detached from the thread: the reviewer can't tie it to their finding,
the conversation can't be resolved, and the thread keeps looking unanswered.

When you disagree with a comment, still reply in-thread explaining why, instead of silently
skipping it.

### 6. Push, Re-review, Resolve
```bash
git add -A && git commit -m "address review comments" && git push
```

For CodeRabbit specifically, after pushing fixes, post these as **top-level** PR comments
(CodeRabbit commands are not thread replies):
- `@coderabbitai review` — re-review the new changes (also use this if a prior review stopped
  early / hit a limit)
- `@coderabbitai resolve` — mark its addressed comments as resolved

For human reviewers, resolve the threads in the GitHub UI or ask the reviewer to confirm.

## Goal
- Every comment answered **in its own thread**, all threads resolved, all checks pass,
  PR merge-ready.
