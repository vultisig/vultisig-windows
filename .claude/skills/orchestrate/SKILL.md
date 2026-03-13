---
name: orchestrate
description: End-to-end workflow orchestrator. Accepts a GitHub issue number and automates the complete implementation pipeline from planning through PR creation.
---

# Orchestrate Implementation (God Mode)

## Overview

This skill takes a GitHub issue number and handles the **entire workflow end-to-end**:
1. Reads the GitHub issue from vultisig organization
2. Checks if iOS or Android already implemented the feature
3. Creates a git branch
4. Plans the implementation strategy
5. Implements across desktop and/or extension workspaces
6. Runs quality checks in a loop until passing
7. Runs tests and fixes failures
8. Commits with conventional format
9. Creates a PR with metadata
10. Updates the GitHub issue

## Invocation

```bash
/orchestrate #123
```

Or with full issue URL:
```bash
/orchestrate https://github.com/vultisig/vultisig/issues/123
```

## Parallelization Strategy

This orchestrator uses explicit stages to control how many agents work simultaneously. You can optimize for speed, token efficiency, or automated overnight runs.

### Parallelization Stages

**Stage 1 — Gather Context (PARALLEL, 3 agents max):**
- Agent A: Read GitHub issue details
- Agent B: Check native platforms (iOS/Android/VultiServer) for existing implementation
- Agent C: Search codebase for related resolver patterns, existing chain logic, etc.

**Stage 2 — Plan (SEQUENTIAL):**
- Synthesize findings from Stage 1
- Create implementation plan
- Present plan to user for confirmation (unless --auto flag is used)

**Stage 3 — Implement (PARALLEL, up to 4 agents for large tasks):**
- Agent A: Core logic (resolvers, chain-specific code)
- Agent B: Desktop UI (@clients/desktop)
- Agent C: Extension UI (@clients/extension) — if affected
- Agent D: Tests + types
- CRITICAL: Never parallelize work that touches protected boundaries (core/mpc/, tss/, lib/)

**Stage 4 — Validate & Ship (SEQUENTIAL):**
- Run `yarn check:all` loop until passing
- Run `yarn dev:desktop` and `yarn dev:extension` for manual testing
- Commit, create PR, update GitHub issue

### Controlling Parallelism

- **Default**: Moderate parallelism (2-3 concurrent agents)
- **For maximum speed**: `orchestrate #123 --parallel=max` → uses up to 4 agents in Stage 3
- **For token conservation**: `orchestrate #123 --sequential` → everything runs sequentially
- **For overnight automation**: `orchestrate #123 --auto` → skips user confirmation in Stage 2

## Workflow

### Phase 1: Issue Analysis and Validation

**Step 1.1: Extract Issue Number**
```bash
# Parse input: accept #123, 123, or full GitHub URL
ISSUE_NUMBER=$(echo "$INPUT" | grep -oE '[0-9]+' | tail -1)
```

**Step 1.2: Fetch Issue Details**
```bash
gh issue view "$ISSUE_NUMBER" --json title,body,labels,state --repo vultisig/vultisig
```

Validate:
- Issue exists and is not `closed`
- Issue is assigned (if not, return context for user to assign)
- Issue has clear acceptance criteria

**Step 1.3: Check Native Implementation Status**

Use `/check-native-feature` skill pattern:
- Extract 2-4 keywords from issue title/description (feature name, symbols, class names)
- Search iOS and Android main branches for implementations
- Return status: `implemented in iOS`, `implemented in Android`, `implemented in both`, or `not implemented yet`

**Decision Tree**:
```
If implemented in both → Note this, continue (reference only)
If implemented in one → Flag for cross-platform balance
If not implemented → Warn user, wait for confirmation to proceed
```

### Phase 2: Branch and Planning

**Step 2.1: Create Working Branch**

Use `/create-branch` skill pattern:
```bash
git checkout main
git pull
git checkout -b {ISSUE_NUMBER}-{slugified-title}
```

Example: Issue #456 "Add TON swap feature" → `456-add-ton-swap-feature`

**Step 2.2: Architecture Planning**

Read the issue description and analyze:

1. **Scope Assessment**
   - Desktop only? Extension only? Both?
   - Does it require new APIs or domain logic?
   - Are protected boundaries involved (core/mpc/, tss/, lib/)?

2. **Integration Points**
   - Which workspace packages are affected? (@clients/desktop, @clients/extension, @core/*, @lib/*)
   - Does it need resolver patterns for chain-specific logic?
   - Does it need state management (Zustand)?
   - Does it need server state (React Query)?

3. **Design Outline**
   - Component structure (one component per file)
   - Styling approach (styled-components)
   - API/data models required
   - i18n strings needed (en.ts only initially)

**Step 2.3: Present Plan to User**

Create a summary:
```markdown
## Implementation Plan

### Affected Workspaces
- @clients/desktop: [list affected areas]
- @clients/extension: [list affected areas]
- @core/*: [list affected core packages]
- @lib/*: [list affected lib packages]

### Architecture
- [Component hierarchy]
- [State management strategy]
- [API integration points]
- [Protected boundaries: AVOID if possible]

### Protected Boundaries (DO NOT EDIT)
- core/mpc/
- tss/
- lib/
→ Inform user if these are involved

### Key Design Decisions
- [Resolver patterns for chain logic?]
- [React Compiler compatible? (no useMemo/useCallback)]
- [i18n required?]
- [Styling strategy (styled-components)?]
```

Wait for user confirmation before proceeding.

### Phase 3: Implementation

**Step 3.1: Create Base Files Structure**

Based on plan, scaffold:
```
clients/desktop/src/
  pages/YourFeature/
    YourFeature.tsx
    YourFeature.module.scss (if styled-components not used)
    YourFeatureContext.ts (if local state)

clients/extension/src/
  [similar if needed]

core/YourFeature/
  src/
    index.ts
    types.ts
    resolver.ts (if chain-specific)
    hooks.ts (if React hooks)
```

**Step 3.2: Development Cycle**

For each file/feature:

1. **Code Implementation**
   - Follow workspace patterns (resolver, React Compiler, styled-components, etc.)
   - NO manual memoization (React Compiler handles it)
   - NO `as` casts (use resolver patterns with discriminated unions)
   - Use `type` over `interface`
   - Use `attempt()` over try-catch for user-facing errors
   - Use `shouldBePresent()` for required values
   - One component per file
   - Workspace imports: relative within package, use workspace names cross-package

2. **Code Quality Validation**
   - After each file or component set, run quality check

**Step 3.3: Continuous Quality Check Loop**

After initial implementation or significant changes:

```bash
# Run quality checks in sequence
yarn typecheck
yarn lint:fix
yarn knip
```

Repeat until all three pass:
- **typecheck failure**: Fix type errors or use resolver patterns
- **lint:fix failure**: ESLint will auto-fix most issues; if manual fixes needed, apply them
- **knip failure**: Fix unused exports/imports

Once passing, run:
```bash
yarn test
```

If tests fail:
- Review test output
- Fix implementation or update tests if intentional change
- Re-run until passing

**Phase 3.4: i18n Setup (if needed)**

If issue requires user-facing strings:
1. Add strings to `core/ui/src/i18n/en.ts` ONLY
2. Run `yarn translate` to generate other languages
3. Never manually edit non-English translation files

### Phase 4: Quality Assurance

**Step 4.1: Full Check Suite**

```bash
yarn check:all
```

This runs:
```bash
yarn lint && yarn typecheck && yarn test && yarn knip
```

All must pass before commit.

**Step 4.2: Desktop Dev Test (if desktop changes)**

```bash
yarn dev:desktop
```

Manually verify:
- App starts without errors
- Feature renders correctly
- Feature works as described in issue
- No console errors or warnings

**Step 4.3: Extension Dev Test (if extension changes)**

```bash
yarn dev:extension
```

Manually verify on a test extension build.

### Phase 5: Commit and Push

**Step 5.1: Stage Changes**

```bash
git status
git diff --stat

# Stage specific files, NEVER use git add . or git add -A
git add clients/desktop/src/... core/...
```

**Step 5.2: Create Commit**

Use conventional commit format:
```bash
git commit -m "$(cat <<'EOF'
feat: add [feature name] support

- Describe the feature in detail
- List key changes
- Note any important implementation decisions

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

Conventional commit types:
- `feat:` new feature
- `fix:` bug fix
- `refactor:` restructure without behavior change
- `perf:` performance improvement
- `test:` test additions/updates
- `docs:` documentation
- `chore:` maintenance

**Step 5.3: Push Branch**

```bash
git push -u origin $(git branch --show-current)
```

### Phase 6: Pull Request

**Step 6.1: Create PR**

Use `/create-pr` skill pattern or manual:

```bash
gh pr create \
  --title "feat: add [feature name]" \
  --body "$(cat <<'EOF'
## Summary
- Brief description of implementation
- Key changes made
- Architecture patterns used

## Issue
Closes #123

## Testing
- [ ] yarn check:all passes
- [ ] yarn dev:desktop tested
- [Include manual testing steps]
- [Include edge cases tested]

## Implementation Notes
- [Any complex decisions?]
- [Protected boundaries avoided?]
- [Resolver patterns used correctly?]
- [React Compiler compatible?]

### Agent Metadata
- Orchestrated via `/orchestrate #123` skill
- Quality checks: ✓ All passing
- Code review ready

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

**Step 6.2: Return PR URL**

Print the created PR URL for user review.

### Phase 7: Issue Update

**Step 7.1: Link PR to Issue**

Once PR is created, add comment to original issue:

```bash
gh issue comment "$ISSUE_NUMBER" \
  --body "PR created: [PR URL]

This implementation:
- Uses resolver patterns for chain-specific logic
- Follows React Compiler guidelines (no useMemo/useCallback)
- Includes full test coverage
- All quality checks passing

Ready for review."
```

**Step 7.2: Move Issue (if applicable)**

If your workspace has Linear or project board integration, move issue to "In Review" or similar.

## Key Rules and Patterns

### Architecture Patterns

**1. Resolver Pattern (MANDATORY for chain-specific logic)**

NEVER use:
```typescript
// BAD: switch on chain type
if (chain.type === 'bitcoin') { ... }
```

INSTEAD:
```typescript
// GOOD: resolver pattern with generics
export const myResolver: ChainResolver<ReturnType> = {
  bitcoin: (chain) => { ... },
  ethereum: (chain) => { ... },
  // exhaustive
}

const result = matchDiscriminatedUnion(chain, 'kind', myResolver)
```

**2. React Compiler**
- NO `useMemo`
- NO `useCallback`
- NO `React.memo` unless absolutely necessary
- Write plain expressions and inline functions
- Compiler optimizes at build time

**3. Typing**
- `type` over `interface`
- NO `as` casts except at routing boundaries
- Use `shouldBePresent()` for required values
- Use discriminated unions for variants

**4. Error Handling**
- Use `attempt()` for value-producing errors:
  ```typescript
  const result = await attempt(() => fetch())
  if ('data' in result) { ... }
  else { handle(result.error) }
  ```
- Use try/catch only for cleanup (try/finally) or isolated boundaries

**5. State Management**
- **Local component state**: `useState`
- **App state**: Zustand
- **Server state**: React Query
- **Styling**: `styled-components`

**6. Imports**
- Relative imports within same package
- Workspace names for cross-package: `import { X } from '@core/ui'`

**7. i18n**
- Only edit `en.ts`
- Run `yarn translate` to generate others
- Never manually edit translated files

### File Organization

```
package/
  src/
    index.ts          # exports
    types.ts          # type definitions
    components/
      MyComponent.tsx # one component per file
    hooks/
      useMyHook.ts
    resolvers/        # chain-specific logic
      myResolver.ts
    services/         # business logic
      myService.ts
    i18n/
      en.ts           # strings (ONLY edit this)
  tests/
    myComponent.test.tsx
```

### Quality Check Strategy

1. **Incremental checking**: After each major feature, run `yarn check`
2. **Fix in order**: typecheck → lint:fix → knip
3. **Test early**: Run `yarn test` alongside implementation
4. **Full validation**: Before commit, run `yarn check:all`

## Decision Tree for Protected Boundaries

```
Is the feature in core/mpc/, tss/, or lib/?
├─ YES → STOP. Inform user this requires core team approval.
│        Do NOT modify these areas.
├─ NO → Proceed with implementation.

Does the feature require chain-specific logic?
├─ YES → Use resolver pattern with discriminated union
├─ NO → Implement directly in component

Does the feature need component memoization?
├─ YES (list reasons: many re-renders, expensive computation)
├─ NO → Rely on React Compiler

Does the feature have user-facing text?
├─ YES → Add to en.ts, run yarn translate
├─ NO → Proceed
```

## Troubleshooting

### `yarn check` fails

**typecheck errors:**
- Fix type annotations
- Use resolver patterns for chain variants
- NO `as any` casts
- Use `shouldBePresent()` for required values

**lint:fix failures:**
- Run `yarn lint:fix` again (usually auto-fixes)
- If manual fixes needed, apply them
- Common: import sorting, naming conventions

**knip failures:**
- Remove unused exports: `export const X = ...` that nothing imports
- Remove unused imports: `import { X } from ...` that code doesn't use
- Check if file is dead code (not imported by anyone)

### Tests fail

- Review test output for assertion failures
- Fix implementation logic or update tests if intentional
- Run `yarn test` to confirm fix
- Run `yarn check:all` before commit

### Desktop dev server fails

```bash
yarn dev:desktop
```

- Check `.env` is loaded (load-envrc.sh runs at session start)
- Ensure `yarn check` passes first
- Kill any existing Wails processes: `pkill -f wails`
- Try full rebuild: `yarn build:desktop` then `yarn dev:desktop`

### PR not created

- Verify branch is pushed: `git push -u origin BRANCH_NAME`
- Verify GitHub token is valid: `gh auth status`
- Check repo slug is correct: `vultisig/vultisig`

## Session Integration

This skill assumes:
- Git user configured: `antoni0dev` / `63366707+antoni0dev@users.noreply.github.com`
- `.envrc` loaded (SessionStart hook handles this)
- GitHub token configured for `gh` CLI
- Node/Yarn installed
- All yarn dependencies installed

## Notes

- **Deterministic**: Follow the phases in order. Skip only if user confirms.
- **Verbose output**: Report progress at each phase. Include command outputs.
- **User confirmation**: Major decisions (protected boundaries, architecture) require approval before proceeding.
- **Error recovery**: If any command fails, pause and present the error. Ask user for next steps.
- **Testing**: Emphasize manual testing in dev servers. Don't assume tests cover all edge cases.

---

## Quick Reference: Conventional Commits

```
feat:      new feature for the user
fix:       bug fix for the user
docs:      documentation changes
style:     changes that don't affect code meaning (whitespace, semicolons)
refactor:  code change that doesn't fix bug or add feature
perf:      code change that improves performance
test:      adding or updating tests
chore:     changes to build/dependencies/tooling
ci:        CI/CD configuration changes
```

Format:
```
<type>(<scope>): <subject>

<body>

<footer>
```

Example:
```
feat(wallet): add TRC20 token transfer support

- Implement token transfer resolver for TON chain
- Add transfer validation and balance check
- Update wallet balance after successful transfer

Closes #123

Co-Authored-By: Claude <noreply@anthropic.com>
```
