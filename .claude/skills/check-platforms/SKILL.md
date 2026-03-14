---
name: check-platforms
description: Search and analyze feature implementations in sibling iOS, Android, and backend repositories. Use when porting features or validating cross-platform parity.
---

# Check Platforms (Cross-Platform Reference)

## Overview

This skill searches sibling repositories for existing feature implementations:
- **vultisig-ios** (Swift/SwiftUI)
- **vultisig-android** (Kotlin)
- **VultiServer** (Go backend)

Returns a structured mapping of native patterns to TypeScript/React patterns used in vultisig-windows.

## Invocation

```bash
/check-platforms [feature-name] [keywords...]
```

Examples:
```bash
/check-platforms "token swap" swap dex TON
/check-platforms "keysign flow" keysign MPC vault
/check-platforms "wallet balance" balance fetch query
```

## Workflow

### Phase 1: Repository Sync

**Step 1.1: Fast-Forward Pull**

```bash
# Sync all sibling repos
git -C /sessions/blissful-zen-johnson/mnt/T_R/vultisig-ios pull --ff-only 2>/dev/null || echo "iOS repo not available or at latest"
git -C /sessions/blissful-zen-johnson/mnt/T_R/vultisig-android pull --ff-only 2>/dev/null || echo "Android repo not available or at latest"
git -C /sessions/blissful-zen-johnson/mnt/T_R/VultiServer pull --ff-only 2>/dev/null || echo "Backend repo not available or at latest"
```

**Step 1.2: Verify Repos Exist**

Check which sibling repos are available:
```bash
test -d ../vultisig-ios && echo "✓ iOS repo found" || echo "✗ iOS repo not found"
test -d ../vultisig-android && echo "✓ Android repo found" || echo "✗ Android repo not found"
test -d ../VultiServer && echo "✓ Backend repo found" || echo "✗ Backend repo not found"
```

### Phase 2: Broad History Search

**Step 2.1: Search Commit Histories**

Look for feature keywords in recent main branch commits (cheap, broad pass):

```bash
# iOS: search last 300 commits
git -C ../vultisig-ios log origin/main --oneline -300 2>/dev/null | rg -i "KEYWORD1|KEYWORD2|KEYWORD3" || echo "No matches in iOS history"

# Android: search last 300 commits
git -C ../vultisig-android log origin/main --oneline -300 2>/dev/null | rg -i "KEYWORD1|KEYWORD2|KEYWORD3" || echo "No matches in Android history"

# Backend: search last 300 commits
git -C ../VultiServer log origin/main --oneline -300 2>/dev/null | rg -i "KEYWORD1|KEYWORD2|KEYWORD3" || echo "No matches in Backend history"
```

### Phase 3: Code Search (Concrete Implementation)

**Step 3.1: Search Main Branch Snapshots**

Search actual code for keywords in production code paths:

```bash
# iOS production code
git -C ../vultisig-ios grep -nEi "KEYWORD1|KEYWORD2|KEYWORD3" origin/main -- \
  'VultisigApp/VultisigApp/' \
  'VultisigApp/Crypto/' \
  'VultisigApp/Helpers/' \
  'VultisigApp/ViewModels/' \
  'VultisigApp/Models/' 2>/dev/null || echo "No iOS code matches"

# Android production code
git -C ../vultisig-android grep -nEi "KEYWORD1|KEYWORD2|KEYWORD3" origin/main -- \
  'app/src/main/java/' 2>/dev/null || echo "No Android code matches"

# Backend Go code
git -C ../VultiServer grep -nEi "KEYWORD1|KEYWORD2|KEYWORD3" origin/main -- \
  'api/' 'chain/' 'service/' 'handler/' 2>/dev/null || echo "No Backend code matches"
```

### Phase 4: Evidence Review

**Step 4.1: Read Implementation Details**

For each keyword match found, read 1-3 relevant files to confirm:
- Feature is implemented (not just mentioned in comments/tests)
- Implementation is in production paths (not test/docs only)
- Code is on `origin/main` (not feature branches)

**Step 4.2: Map Implementation Patterns**

For each platform, identify:

**iOS (Swift/SwiftUI)**
- View (SwiftUI component)
- ViewModel (state and business logic)
- Service/Repository (API calls and data layer)
- Data Models (Codable structs)
- Enums and types

**Android (Kotlin)**
- Fragment/Activity (UI)
- ViewModel (lifecycle-aware state)
- Repository/Service (data access)
- Data Classes (model objects)
- Sealed classes (type variants)

**Backend (Go)**
- Handler/Route (endpoint logic)
- Service/Repository (business logic)
- Models/Types (data structures)
- API contracts (request/response)

### Phase 5: Output Format

Return structured analysis:

```markdown
# Platform Implementation Analysis: [Feature Name]

## Overview
- Feature: [description]
- Keywords searched: [list]
- Search scope: origin/main only

## iOS Status
**Implemented: [YES/NO/PARTIAL]**
- Confidence: [high/medium/low]
- Files: [list of files with line numbers]
- Pattern summary:
  - View: [SwiftUI component name/path]
  - ViewModel: [class name/path]
  - Service: [class name/path]
  - Key types: [important types/enums]

## Android Status
**Implemented: [YES/NO/PARTIAL]**
- Confidence: [high/medium/low]
- Files: [list of files with line numbers]
- Pattern summary:
  - Fragment/Activity: [class name/path]
  - ViewModel: [class name/path]
  - Repository: [class name/path]
  - Key types: [important sealed classes/data classes]

## Backend Status
**Implemented: [YES/NO/PARTIAL]**
- Confidence: [high/medium/low]
- Files: [list of files with line numbers]
- Pattern summary:
  - Endpoint: [route/handler name/path]
  - Service: [function names/path]
  - Data models: [type names]

## Native → TypeScript Mapping

| Native Pattern | TypeScript Equivalent | Notes |
|---|---|---|
| SwiftUI View | React Component | One component per file |
| ViewModel | Zustand store + React hooks | Use `useShallow()` if needed |
| Repository | React Query (useQuery/useMutation) | Server state from API |
| Service | Custom hook or util function | Business logic extraction |
| Enum | Discriminated union or string literal | Use `type`, not `interface` |
| Optional type `T?` | `T \| undefined` or `shouldBePresent()` | Type-safe, not fallbacks |
| Struct/Data class | `type` definition | Use `readonly` for immutability |
| Sealed class | Discriminated union | Use `matchDiscriminatedUnion()` |

## Implementation Notes

### View/Component Layer
```
iOS SwiftUI View
  ↓
React Component
  - Same props structure
  - Same event handlers
  - Same conditional rendering
  - Use Match component for variants
```

### State Management
```
iOS ViewModel (@ObservedObject)
  ↓
Zustand store + useShallow()
  - Same state shape
  - Same derived computed values
  - Same side effects (use Effects in Zustand)
```

### API Integration
```
iOS Service (URLSession)
  ↓
React Query (useQuery/useMutation)
  - Same endpoint
  - Same request/response structure
  - Same error handling (attempt() pattern)
```

### Data Models
```
iOS Codable struct
  ↓
TypeScript type
  - Same fields
  - Same optional/required constraints
  - Use shouldBePresent() for required values
```

## Key Differences (Swift/Kotlin → TypeScript)

| Aspect | Swift | Kotlin | TypeScript |
|--------|-------|--------|-----------|
| Component state | @State var | mutableStateOf() | useState() |
| Shared state | @EnvironmentObject | ViewModel | Zustand store |
| Effects | .onAppear, .onChange | LaunchedEffect | useEffect |
| Async | async/await | Coroutines, async/await | async/await |
| Optionals | T? | T? | T \| undefined |
| Immutability | let (default) | val (default) | const + readonly |
| Type variants | Enum cases | Sealed class | Discriminated union |
| Error handling | try/catch, Optional | try/catch, null checks | attempt() + pattern matching |

## Off-Main Signals

If implementation found only on feature branches or draft PRs:
```
⚠️ Implementation IN PROGRESS (not on main):
  - Branch: [branch name]
  - PR: [PR link]
  - Status: [not yet merged, draft, etc.]
  → For reference only; feature NOT officially implemented yet
```

## Confidence Rules

- **High confidence**: Code exists in production path, is called/wired, logic is complete
- **Medium confidence**: Code exists but wiring unclear, partial implementation, or might need extension
- **Low confidence**: Only comments/mentions, tests only, docs only, or keyword match but wrong context

## Next Steps

### If Implemented (High Confidence)
1. Read full implementation in native repo
2. Create TypeScript version following our patterns
3. Map each component/service/model to our equivalents
4. Use this skill output as reference during implementation

### If Implemented (Medium/Low Confidence)
1. Clarify with native team or reviewers
2. Check if feature branch has working implementation
3. Decide: reference branch or wait for main merge?

### If Not Implemented
1. Coordinate with native teams on planned implementation
2. Consider waiting for native version before starting TS version
3. Or proceed with TypeScript prototype

## Examples

### Example 1: Token Swap Feature
```markdown
# Platform Implementation Analysis: Token Swap

## iOS Status
**Implemented: YES**
- Confidence: HIGH
- Files:
  - VultisigApp/ViewModels/SwapViewModel.swift:45-200
  - VultisigApp/Services/SwapService.swift:1-150
  - VultisigApp/Models/SwapQuote.swift

## Android Status
**Implemented: YES**
- Confidence: HIGH
- Files:
  - app/src/main/java/com/vultisig/wallet/viewmodel/SwapViewModel.kt
  - app/src/main/java/com/vultisig/wallet/repository/SwapRepository.kt

## Backend Status
**Implemented: YES**
- Confidence: HIGH
- Files:
  - api/swap.go: POST /swap/quote, POST /swap/submit
  - service/swap_service.go

## Native → TypeScript Mapping

| Component | iOS | Android | TS Equivalent |
|---|---|---|---|
| Main state | @StateObject SwapViewModel | SwapViewModel | Zustand + useQuery |
| Quote fetch | URLSession | Retrofit | React Query useQuery |
| Submit action | async/await | Coroutine | useMutation |
| Quote type | Codable struct | data class | type SwapQuote |
| Error handling | try/catch | try/catch | attempt() pattern |
```

### Example 2: Keysign Flow
```markdown
# Platform Implementation Analysis: Keysign Flow

## iOS Status
**Implemented: YES**
- Confidence: HIGH
- Files:
  - VultisigApp/ViewModels/KeysignViewModel.swift
  - VultisigApp/Views/KeysignView.swift
  - VultisigApp/Services/KeysignService.swift

## Android Status
**Implemented: YES**
- Confidence: HIGH
- Files: [list Android files]

## Implementation Notes
- Uses MPC library (shared across platforms)
- Multi-step approval flow
- WebSocket for device communication
```

## Troubleshooting

### Repo not syncing
```bash
git -C ../vultisig-ios fetch origin
git -C ../vultisig-ios pull origin main
```

### Grep finds nothing
- Check keywords are specific enough
- Try broader search: remove qualifiers, search just function names
- Feature might not exist yet (return "not implemented")

### File not readable
- Verify path is relative to repo root
- Use full path from sibling repo location

## Repository References

| Repo | Path | Build System |
|------|------|--------------|
| iOS | /sessions/blissful-zen-johnson/mnt/T_R/vultisig-ios | Xcode/Swift Package Manager |
| Android | /sessions/blissful-zen-johnson/mnt/T_R/vultisig-android | Gradle/Kotlin |
| Backend | /sessions/blissful-zen-johnson/mnt/T_R/VultiServer | Go |
| Windows | /sessions/blissful-zen-johnson/mnt/T_R/w | Yarn workspaces |

## Notes

- **Only reference main**: Do NOT use feature branch code as proof of implementation
- **Prefer production paths**: Read actual implementation, not test or docs
- **Structure output clearly**: Use tables and sections for easy reference
- **Map patterns explicitly**: Show exact equivalent in TypeScript
- **Off-main hints are context only**: Always note if feature is not yet merged
