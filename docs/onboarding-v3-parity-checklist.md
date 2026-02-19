# Onboarding v3 Parity Checklist

Last updated: 2026-02-19

## Scope
- New setup/keygen onboarding flow only.
- Desktop + Extension parity at the core UI flow level.
- Legacy slideshow onboarding is explicitly out of scope.

## Figma node tracking
| Node ID | Flow area | Primary code surfaces |
|---|---|---|
| `59607-125493` | Setup selection | `core/ui/vault/create/setup-vault/index.tsx` |
| `63140-112692` | Setup overview | `core/ui/vault/create/setup-vault/vault-setup-overview/VaultSetupOverviewContent.tsx` |
| `62909-114663` | Keygen loading | `core/ui/mpc/keygen/progress/KeygenLoadingAnimation.tsx` |
| `60804-29881` | Peer discovery placeholders | `core/ui/mpc/devices/peers/PeerPlaceholder.tsx` |
| `60942-36472` | Waiting for server/session | `core/ui/mpc/fast/WaitForServerStep.tsx`, `core/ui/mpc/session/WaitMpcSessionStart.tsx` |
| `63140-147485` | Backup overview/splash | `core/ui/vault/backup/BackupOverviewScreen/index.tsx`, `core/ui/vault/backup/BackupInCloudScreen.tsx` |
| `60786-186591` | Backup summary/review | `core/ui/vault/backup/VaultBackupSummaryStep.tsx` |
| `61122-120918` | Create success | `core/ui/mpc/keygen/create/CreateVaultSuccessScreen.tsx` |
| `61114-36462` | End-of-flow success | `core/ui/mpc/keygen/flow/KeygenFlowSuccess.tsx` |
| `61114-36867` | End-of-flow success variant/state | `core/ui/mpc/keygen/flow/KeygenFlowSuccess.tsx` |

## Current audit state
- Source evidence matrix: `docs/onboarding-v3-parity-evidence.md`
- Node capture source: authenticated Chrome inspect extraction in `docs/onboarding-v3/figma-meta/*.json` (local artifacts, not committed).
- Current strict parity status: blocked on visual capture proof for final PASS sign-off.

## Manual smoke matrix
| Scenario | Expected |
|---|---|
| New vault -> setup selection -> secure path -> backup -> success | All onboarding-v3 screens render without layout break and proceed to vault page. |
| New vault -> setup selection -> fast path -> backup -> success | Fast flow uses fast-specific keygen/backup states and completes successfully. |
| Join/paired device keygen | Non-initiating wait states and peer placeholders render onboarding-v3 waiting animations. |
| Desktop vs Extension setup entry | Both clients progress through the same core create-flow states (`CreateFastVaultFlow`/`CreateSecureVaultFlow`). |

## Regression gates
- `yarn typecheck`
- `yarn lint:fix`
- `yarn test`
- `yarn knip`
- `yarn check:all`
