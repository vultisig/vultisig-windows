---
description: USE sibling repos (iOS, Android, SDK, etc.) as reference WHEN porting features TO match behavior in our TypeScript style
---

# Reference Codebases

USE this skill WHEN the user says "port from iOS/Android", "reference codebases", or references a sibling repo's implementation.

## Strategy

1. **Find sibling repos**: Go up one level from the workspace root (`../`) to find repositories.
2. **Sync before reading**: Run `git -C ../<repo> pull --ff-only` to get latest changes.
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
