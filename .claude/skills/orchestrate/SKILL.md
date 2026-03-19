---
name: orchestrate
description: God-mode orchestrator. Takes a Linear ticket OR PR and handles the ENTIRE workflow end-to-end — branch creation, implementation, testing, commits, PR creation, Linear updates, OR exhaustive PR review with parallel agents. Use for complete feature delivery or deep PR audits.
argument-hint: "[ticket-id or PR branch/URL] [--review] [--auto]"
disable-model-invocation: true
---

# Orchestrator: End-to-End Workflow

Two operating modes:

## Mode A — Feature Delivery (default)
Takes a Linear ticket ID and handles the entire pipeline:
1. Fetch and understand the ticket
2. Create a git branch
3. Plan implementation
4. Implement across all files with maximum parallelism
5. Build-review-fix loop until clean
6. Smart test generation
7. Commit, push, create PR
8. Update Linear ticket

## Mode B — PR Review (`--review`)
Takes a PR branch name or URL and performs an exhaustive audit:
1. Fetch all commits and changed files
2. Spawn parallel review agents across every domain
3. Report findings with file:line references and fix suggestions

---

## Parallelization Philosophy

**Use as many parallel agents as needed to complete tasks in the fastest, most efficient, and highest-quality way possible.** There is no artificial cap on concurrency — spawn agents aggressively for independent work streams. The goal is perfection at maximum speed.

### Worker Coordination Protocol

When spawning parallel agents:

1. **File-based coordination** — Each agent works on independent files. Never assign two agents to the same file.
2. **Cross-agent synthesis** — When Agent A produces output that Agent B needs, the orchestrator reads A's deliverables and feeds relevant context to B. Workers never talk directly — the orchestrator is the routing layer.
3. **Quality gates with push-back** — No agent's work is marked done until deliverables are reviewed. Bad output gets pushed back for fixes.
4. **Stall detection** — If an agent is stuck (repeated failures, no progress), reassess the approach and push with specific unblocking instructions.
5. **Convergence criteria** — When parallel agents start producing overlapping concerns (e.g., shared types, cross-module imports), collapse remaining work to sequential. Parallel is for independent work; the moment dependencies emerge, go sequential.

### Parallelization Stages (Feature Delivery)

**Stage 1 — Gather Context (PARALLEL, unlimited agents):**
- Agent A: Read Linear ticket details + acceptance criteria
- Agent B: Search codebase for related files, existing patterns, similar implementations
- Agent C: Read vultisig-knowledge repo docs if touching new domains (MPC, chain logic, etc.)
- Agent D+: Any additional context gathering needed (e.g., checking upstream lib/ patterns)

**Stage 2 — Plan (SEQUENTIAL):**
- Synthesize findings from Stage 1
- Create implementation plan with parallelization strategy
- Present plan to user for confirmation (unless `--auto` flag)

**Stage 3 — Implement (PARALLEL, unlimited agents):**
- Split implementation across independent modules/files/packages
- Each agent handles one domain (e.g., Agent A: core logic, Agent B: UI components, Agent C: tests, Agent D: resolver implementations, Agent E: i18n, etc.)
- ONLY parallelize if files are truly independent (no cross-imports between agents' work)
- For small tasks (1-3 files), use a single agent sequentially

**Stage 3.5 — Skill Passes:**
- Run `/simplify` on changed files before self-review
- Run context-appropriate skills:
  - UI component → `/storybook-component` (if available)
  - Pure logic/resolvers → `/simplify` only
  - Refactor → `/simplify` only

**Stage 4 — Build-Review-Fix Loop (SEQUENTIAL, persistent):**
- Run `yarn check` → fix → repeat until passing
- Run `yarn test` → fix failures → repeat until passing
- Run smart test generation (evaluate what tests are needed, write them)
- Do NOT stop after reporting failures — keep iterating until ALL gates pass

**Stage 5 — Ship (SEQUENTIAL):**
- Commit with conventional format
- Push and run roborev loop
- Create PR as draft
- Update Linear ticket

### Parallelization Stages (PR Review)

**Stage 1 — Gather PR Context (PARALLEL):**
- Agent A: Fetch all commits, diff, and changed file list
- Agent B: Read project rules and CLAUDE.md for standards reference
- Agent C: Identify all domains touched (chain logic, UI, state, MPC, etc.)

**Stage 2 — Deep Review (PARALLEL, one agent per domain):**
Spawn an agent for EACH of these review dimensions across ALL changed files:
- **Type Safety Agent**: No `as` casts, no unnecessary `?.`/`??`, proper `shouldBePresent()`/`assertField()`, derived types from const arrays, no `any`
- **Pattern Matching Agent**: No switch/case, use Record lookups and resolver pattern, config arrays for repetitive conditionals, exhaustive discriminated unions
- **Performance Agent**: Re-render blast radius (colocated state?), time complexity of algorithms (O(n) vs O(n^2)), unnecessary iterations, derived values vs redundant state, React Compiler compliance (no useMemo/useCallback)
- **Architecture Agent**: Resolver pattern for chain logic, proper import boundaries (relative within package, workspace names cross-package), one component per file, feature-based organization
- **Code Quality Agent**: DRY violations, magic numbers/strings, readable code over comments, proper error handling (attempt() vs try-catch), shared utility reuse, i18n compliance
- **Composition Agent**: Children as render optimization, elements-as-props, moving state down, key-based remounting, derive state (never sync via useEffect), error boundary placement

**Stage 3 — Synthesize & Report (SEQUENTIAL):**
- Merge all agent findings
- Deduplicate and prioritize: **critical** (breaks at runtime) > **important** (violates standards) > **nitpick** (style preference)
- Present actionable report with file:line references
- If `--fix` flag: auto-apply fixes and run `yarn check` to validate

---

## Implementation Standards

**Follow ALL `.claude/rules/` strictly.** The rules are the source of truth for TypeScript, React, pattern matching, styling, file structure, error handling, code quality, and testing.

**Key orchestrate-specific reminders:**
- Resolver pattern for ALL chain-specific logic (`Record<ChainType, Resolver>`)
- `shouldBePresent()` / `assertField()` for required runtime values at boundaries
- Never `useMemo`/`useCallback` — React Compiler handles memoization
- Never switch/case — Record lookups, `match()`, config arrays
- Object parameters for >1 arg (`{FunctionName}Input`)
- `attempt()` over try-catch (only for user-facing errors)
- Relative imports within package, workspace names cross-package
- i18n: `useTranslation()`, only edit `en.ts`, run `yarn translate`
- JSDoc on all exported functions, classes, and type definitions
- styled-components for styling (use theme tokens, never hardcode)
- One component per file
- Never touch `core/mpc/`, `tss/`, or `lib/` without explicit approval

---

## Step-by-Step: Feature Delivery (Mode A)

### Step 1: Fetch Ticket

Call Linear MCP `get_issue`:
- Extract title, description, status, assignee, git branch name
- Check for blockers (`blockedBy` relation)
- Note design references or related tickets

### Step 2: Git Branch Setup

```bash
git checkout main && git pull
git checkout -b {branch-name-from-linear}
```

If branch exists: `git checkout {branch} && git rebase origin/main`

### Step 3: Plan Implementation

1. Understand requirements and acceptance criteria
2. Map architecture: which packages/modules are affected
3. Identify files to modify and their dependencies
4. Create detailed plan with parallelization strategy
5. Present to user (unless `--auto`)

### Step 4: Implement

Follow ALL `.claude/rules/` + standards above.

### Step 5: Build-Review-Fix Loop

**This is a persistent loop. Do NOT stop until ALL gates pass.**

```
while true:
  1. Run `yarn check` (typecheck + lint:fix + knip)
  2. If fails → read output, fix issues, go to 1
  3. Run `/simplify` on changed files
  4. If simplify suggests improvements → apply, go to 1
  5. Run context-appropriate skills
  6. If issues found → fix, go to 1
  7. All gates pass → break
```

### Step 6: Smart Test Generation

After quality checks pass, evaluate what tests are needed:

**Step 6.1 — Evaluate:**
Analyze what was built and determine test coverage:
- Pure utility/logic → unit tests (Vitest)
- React hooks with state → hook integration tests (renderHook)
- UI components → component integration tests (Testing Library)
- Resolver implementations → unit tests per chain type
- User-facing flows → E2E tests (if Playwright available)

**Step 6.2 — Generate Tests (PARALLEL):**
- **Unit Test Agent**: Pure functions, resolvers, validators, config-driven logic
- **Integration Test Agent**: Hooks with Zustand, components with user interaction
- **E2E Test Agent**: Critical user journeys (if applicable)

**Step 6.3 — Run and Fix:**
```bash
yarn test  # Run all tests, fix failures, repeat until passing
```

### Step 7: Commit

```bash
git add <specific-files>
git commit -m "$(cat <<'EOF'
feat(scope): imperative description

- Detail 1
- Detail 2
EOF
)"
```

Conventional commits enforced. No Co-Authored-By trailer.

### Step 8: Push + Roborev Loop

**This is a persistent loop. Do NOT stop until reviews pass.**

```bash
git push -u origin {branch-name}
```

**Design review first, then code review:**
```
while true:
  1. /roborev-design-review-branch — catches architectural issues before polishing code
  2. If design findings → fix structure/approach, yarn check, amend commit, go to 1
  3. Design passes → /roborev-review-branch — code-level review
  4. If code findings → /roborev-fix to auto-fix, then yarn check, go to 3
  5. If still failing after fix → manually address, amend commit, go to 3
  6. Both reviews pass clean → break
```

If remaining findings depend on product decisions or external actions after two iterations, stop and surface the blocker to the user.

When branch is already pushed, update with `git push --force-with-lease`.

### Step 9: Create PR

```bash
gh pr create --title "feat(scope): description" --body "$(cat <<'EOF'
## Summary
- What and why

## Test Plan
- [ ] `yarn check` passes
- [ ] `yarn test` passes
- [ ] Tested on desktop dev server (yarn dev:desktop)
- [ ] Visual verification at http://localhost:8081
- [ ] `/roborev-review-branch` passes clean

## Related
- Closes VUL-XXXX
EOF
)" --draft
```

### Step 10: Update Linear

Set status to "In Review", add PR link comment.

---

## Pre-Submit Gate

All items must pass before the branch is considered ready:

- [ ] Ticket fetched and understood
- [ ] Branch created from Linear ticket
- [ ] Implementation complete (exhaustive typing + pattern matching)
- [ ] Performance reviewed (no O(n^2), colocated state, no manual memo)
- [ ] All files follow resolver pattern where applicable
- [ ] `/simplify` run on changed files
- [ ] Context-appropriate skills run
- [ ] `yarn check` passes
- [ ] `yarn test` passes (unit + integration)
- [ ] Smart test evaluation performed — appropriate test types generated
- [ ] Conventional commit(s) created (no Co-Authored-By)
- [ ] Branch pushed
- [ ] `/roborev-design-review-branch` passes clean
- [ ] `/roborev-review-branch` passes clean (iterate until both pass)
- [ ] PR created as draft
- [ ] Linear ticket set to "In Review"
- [ ] All `.claude/rules/` satisfied

Run with: `/orchestrate VUL-1234` or `/orchestrate antonio/branch-name --review`
