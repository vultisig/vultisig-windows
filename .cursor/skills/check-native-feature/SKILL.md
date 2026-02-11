---
name: check-native-feature
description: Check whether a feature is already implemented in sibling iOS/Android repositories before porting. Use when the user asks if native already has a feature, asks to verify iOS/Android status, or wants a cheap pre-port implementation check.
---

# Check Native Feature

Use this skill to quickly answer: "Is this already implemented in iOS or Android?"

## Inputs

Collect from the current conversation:

- Feature description (one sentence)
- 2-4 keywords (symbols, chain names, class names, feature terms)
- Optional expected file area (for example: swap, keysign, onboarding)

## Cost-Efficient Workflow

1. **Sync repos (fast-forward only)**

```bash
git -C ../ios pull --ff-only
git -C ../android pull --ff-only
```

2. **Search `main` commit history first (cheap broad pass)**

```bash
git -C ../ios log origin/main --oneline -200 | rg -i "<kw1>|<kw2>|<kw3>"
git -C ../android log origin/main --oneline -200 | rg -i "<kw1>|<kw2>|<kw3>"
```

3. **Search `main` code snapshot for concrete implementation**

```bash
git -C ../ios grep -nEi "<kw1>|<kw2>|<kw3>" origin/main -- .
git -C ../android grep -nEi "<kw1>|<kw2>|<kw3>" origin/main -- .
```

4. **Confirm by reading 1-3 likely files**
- Verify the feature is implemented, not just mentioned in comments/tests.
- Prefer production paths over test/docs paths.
- Read files from `origin/main` when possible to avoid branch drift.

5. **Return status**
- `implemented in iOS`
- `implemented in Android`
- `implemented in both`
- `not implemented yet`

## Branch Policy (Strict)

- Only treat implementation as valid if evidence is on `main`.
- Ignore feature branches, draft PR branches, and non-main commit history for status decisions.
- If evidence exists only off-main, return `not implemented yet`.
- You may mention off-main hints as context, but never as implementation proof.

## Confidence Rules

- **High confidence implemented**: logic exists in production code and is wired/called.
- **Medium confidence implemented**: partial logic exists but wiring is unclear.
- **Low confidence / not implemented**: only comments, tests, docs, or no matches.

## Output Format

Use this exact structure:

```markdown
Feature check: <feature name>

Status: <implemented in iOS|implemented in Android|implemented in both|not implemented yet>
Confidence: <high|medium|low>

Evidence:
- iOS: <commit/file evidence or "none found">
- Android: <commit/file evidence or "none found">
- Off-main signals: <none|branch/PR hints found>

Next step:
- If implemented: "Use reference-native-codebase skill and port."
- If not implemented: "Wait for native implementation."
```

## Notes

- Prefer local git and ripgrep over GitHub API calls.
- Only use GitHub PR search if local repos are missing or stale.
- Do not claim implementation without code evidence.
- Do not use non-main evidence to mark a feature as implemented.
