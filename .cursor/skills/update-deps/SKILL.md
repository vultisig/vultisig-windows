---
name: update-deps
description: Safely update all dependencies to latest versions, fix breakage, and verify apps still work. Use when the user asks to update dependencies, upgrade packages, or run a safe dependency update.
---

# Update Dependencies

Safely update every dependency to the latest version, then verify nothing is broken.

## Step 1 — Update

```bash
yarn update
```

This runs `yarn set version latest`, then `npm-check-updates -u --workspaces --root`, then `yarn install`.

## Step 2 — Check

```bash
yarn check
```

Runs typecheck, lint, and knip. If any sub-command fails, fix the errors:

| Check | Common fixes |
|-------|-------------|
| **typecheck** | Update type annotations, add missing type imports, fix changed API signatures |
| **knip** | Remove newly-unused exports/files, or run `yarn knip:fix` for auto-fixable issues |
| **lint** | Run `yarn lint:fix` — if errors remain, fix manually |

Re-run `yarn check` after each round of fixes. Repeat until clean.

## Step 3 — Smoke-test

Always run smoke tests after updating. Static checks alone don't catch runtime failures (e.g., Vite breaking on stricter export resolution).

Test both **desktop** (Wails, UI at port 8081) and **extension**:

1. Start the dev server for the app being tested (`yarn dev:desktop` or `yarn dev:extension`).
2. Delegate to the `qa` sub-agent (QA environment: `cursor` for both — this is a load-check, not a wallet flow) to confirm the page renders and the browser console has no critical errors.
3. If the app fails to load, investigate and fix before proceeding. Re-run the smoke test after fixing.
4. Stop the dev server before moving to the next app.

## Step 4 — Report

Summarize to the user:
- Number of packages updated
- Any major version bumps and what they affect
- Fixes applied (if any)
- Smoke-test results (desktop + extension)
- Overall confidence level (high / medium with caveats)
