# Onboarding v3 Parity Evidence

Last updated: 2026-02-19

## Method
- Figma source links were opened in authenticated Chrome tabs.
- Node-level inspect metadata was extracted for each referenced `node-id`.
- Code surfaces were mapped per PR branch (`#3378` to `#3381`).
- Strict visual PASS requires a screenshot pair (Figma frame vs app frame) per node.

## Node matrix
| Node ID | Node URL | Screen/state | PR | Status | Delta notes | Evidence |
|---|---|---|---|---|---|---|
| `59607-125493` | https://www.figma.com/design/puB2fsVpPrBx3Sup7gaa3v/Vultisig-App?node-id=59607-125493&m=dev | Setup selection | #3378 | FAIL | Setup mapping and assets are implemented, but no frame screenshot pair is available yet for pixel-level confirmation. | Inspect metadata: `docs/onboarding-v3/figma-meta/59607-125493.json` |
| `63140-112692` | https://www.figma.com/design/puB2fsVpPrBx3Sup7gaa3v/Vultisig-App?node-id=63140-112692&m=dev | Setup overview | #3378 | FAIL | Overview animation mapping is implemented, but frame-level visual parity proof is pending screenshot capture. | Inspect metadata: `docs/onboarding-v3/figma-meta/63140-112692.json` |
| `62909-114663` | https://www.figma.com/design/puB2fsVpPrBx3Sup7gaa3v/Vultisig-App?node-id=62909-114663&m=dev | Keygen loading | #3379 | FAIL | Loading variant resolver is implemented and tested, but screenshot evidence is pending. | Inspect metadata: `docs/onboarding-v3/figma-meta/62909-114663.json` |
| `60804-29881` | https://www.figma.com/design/puB2fsVpPrBx3Sup7gaa3v/Vultisig-App?node-id=60804-29881&m=dev | Peer placeholder | #3379 | FAIL | New placeholder animation is wired, but no visual pair is captured yet. | Inspect metadata: `docs/onboarding-v3/figma-meta/60804-29881.json` |
| `60942-36472` | https://www.figma.com/design/puB2fsVpPrBx3Sup7gaa3v/Vultisig-App?node-id=60942-36472&m=dev | Wait server/session | #3379 | FAIL | Pending-state animations are integrated, but strict screenshot proof is not yet attached. | Inspect metadata: `docs/onboarding-v3/figma-meta/60942-36472.json` |
| `63140-147485` | https://www.figma.com/design/puB2fsVpPrBx3Sup7gaa3v/Vultisig-App?node-id=63140-147485&m=dev | Backup overview/splash | #3378 | FAIL | Backup splash/device variants are mapped, but pixel-level comparison is pending screenshot capture. | Inspect metadata: `docs/onboarding-v3/figma-meta/63140-147485.json` |
| `60786-186591` | https://www.figma.com/design/puB2fsVpPrBx3Sup7gaa3v/Vultisig-App?node-id=60786-186591&m=dev | Backup summary/review | #3380 | FAIL | Review animation integration is done, but final parity proof is blocked on visual evidence. | Inspect metadata: `docs/onboarding-v3/figma-meta/60786-186591.json` |
| `61122-120918` | https://www.figma.com/design/puB2fsVpPrBx3Sup7gaa3v/Vultisig-App?node-id=61122-120918&m=dev | Create success | #3380 | FAIL | Success animation screen is wired, but required screenshot pair is not available. | Inspect metadata: `docs/onboarding-v3/figma-meta/61122-120918.json` |
| `61114-36462` | https://www.figma.com/design/puB2fsVpPrBx3Sup7gaa3v/Vultisig-App?node-id=61114-36462&m=dev | Keygen flow success | #3380 | FAIL | End-flow success uses onboarding v3 animation, but visual proof is pending. | Inspect metadata: `docs/onboarding-v3/figma-meta/61114-36462.json` |
| `61114-36867` | https://www.figma.com/design/puB2fsVpPrBx3Sup7gaa3v/Vultisig-App?node-id=61114-36867&m=dev | Keygen flow success variant | #3380 | FAIL | Variant state is wired to onboarding v3 success visuals, but screenshot pair evidence is not available. | Inspect metadata: `docs/onboarding-v3/figma-meta/61114-36867.json` |

## Remaining blocker for PASS
- Final PASS requires screenshot pairs from authenticated Figma frames and matching app frames for every row above.
