---
name: reference-native-codebase
description: USE native iOS/Android repos as reference WHEN porting features TO match behavior in our TypeScript style
---

# Reference Native Codebase

USE this skill WHEN the user says "port from iOS/Android", "this exists in native", or references native implementation.

## Strategy

1. **Find sibling repos**: Go up one level from the workspace root (`../`) to find native repositories.
2. **Sync before reading**: Run `git -C ../ios pull --ff-only` (or `../android`) to get latest changes.
3. **Explore**: List the parent folder, then use absolute paths to read/search files in the target repo.
4. **Port**: Match behavior 1:1, but write in our TypeScript style following workspace rules.

## Known Sibling Repositories

| Repo | Language | Key Paths |
|------|----------|-----------|
| `ios` | Swift | `VultisigApp/`, Models, ViewModels, Services |
| `android` | Kotlin | `app/src/main/java/`, similar structure |
| `commondata` | Protobuf | Shared message definitions |
| `vultisig-sdk` | Multi | MPC SDK (reference for crypto logic) |
| `community-tools` | TypeScript | `recovery-tools/`, `vultisig-playground/` |

## Swift/Kotlin to TypeScript

| Native | TypeScript |
|--------|------------|
| Optionals (`?`, nullable) | `shouldBePresent()` or union with `undefined` |
| Enums, sealed classes | Discriminated unions or string literals |
| Data class / struct | `type` definition |
| Coroutines / async-await | `async`/`await` |
| `Data` / `ByteArray` | `Uint8Array` |

## Core Principle

**Same behavior, our style.** Match inputs, outputs, edge cases, and errors exactly. Use our resolver patterns, i18n, and coding conventions.

## Example

**User**: "port the fee estimation from iOS"

1. Sync: `git -C ../ios pull --ff-only`
2. Find the feature in `ios/VultisigApp/`
3. Understand inputs, outputs, edge cases
4. Implement in TypeScript following our patterns
5. Verify behavior matches native
