# Icons V3 Adoption — Plan & Decision Record

Tracks the desktop + extension side of adopting the **Icons V3** library across all
screens. Companion to issue [#4383](https://github.com/vultisig/vultisig-windows/issues/4383).

## Background

Desktop icons are **code, not assets**: hand-written inline-SVG React components, one per
file, under `lib/ui/icons/` (~154 single-icon files), `core/ui/agent/icons/`, and
`core/ui/vult/discount/tier/icons/`. Every import is a deep path — there is no barrel.
Both clients (`clients/desktop`, `clients/extension`) consume `@lib/ui`, so replacing a
file's contents under a reused name updates **both** surfaces with zero call-site edits.

The V3 library itself lives in Figma (`Icons V3 UPDATED` section): **1,932 icons across
32 categories**. It is a third-party pack, not a work order — only the subset the app
actually ships needs to migrate (~195 desktop glyphs).

## Decision — converge on one icon set (option **a**)

> **Both brands (`vultisig` and `station`) use the same Icons V3 set.**
> Brand differentiation stays where it belongs — logo, colours, typography — not in the
> icon geometry.

### Why

The `2b9271e2` commit ("Add Station UI token and icon foundation") did **not** design a
second, permanently-different icon language. It migrated ~13 icons to V3 **for the Station
brand only**, gated behind an `iconStyle` theme token, leaving the default `vultisig`
brand on the legacy icons. Evidence:

- `lib/ui/icons/StationFigmaIcons.tsx` holds 13 icons whose names map 1:1 onto the V3
  library (`StationWalletFilledIcon` → `wallet-filled`, `StationChevronLeftIcon` →
  `chevron-left`, …). **11/13 were confirmed present in the V3 Figma library**; the other
  two are name-normalisation misses, not real gaps.
- iOS reached the same end state in PR
  [vultisig-ios#4834](https://github.com/vultisig/vultisig-ios/pull/4834): every shipped
  icon rebuilt on V3, one set, the compiler enforcing full coverage. Its 137 post-merge
  icon names are the V3 names.

So `iconStyle === 'station' ? <StationX/> : <LegacyX/>` is a **migration scaffold**, not a
lasting design. Once the default brand also renders V3, both branches become identical and
the ternary collapses. Keeping two sets forever (option **b**) would instead grow that
ternary toward all 277 importing files for a difference users never see.

### ⚠️ Guard rail — `iconStyle` is overloaded

The `iconStyle` token is also (mis)used for **non-icon** Station styling — e.g.
`lib/ui/search/SearchField.tsx` branches border-radius, font-size, font-weight and
letter-spacing on it. Those are genuine Station-brand visual differences and **must be
preserved**. When the icon ternaries are removed, the styling usages must move to a proper
brand flag (the app already resolves `currentProductBrand === 'station'` at the root in
`core/ui/CoreApp.tsx`), not be deleted with the token.

### Open confirmation

The only thing code cannot prove is product intent. Confirm with design/product:
**"V3 icons identical across both brands (Station keeps logo/colour/type differences), or a
separate icon look per brand?"** All code evidence points to *identical*; this plan assumes
it. If the answer is *separate*, switch to option (b) and this plan changes.

## Phased delivery

Each phase is a **sub-issue** of #4383 with its own PR **targeting the long-lived
integration branch** `feature/icons-v3-adoption` (off `main`, no direct PRs to `main`).
When every phase has merged into the integration branch, a **final PR** promotes it to
`main` with a summary of which PR did what.

### Split axis — by screen, not by icon

The unit of work is a **screen**, not an icon category. A screen is migrated
**all-at-once** — it never ships half V3 / half legacy. This is stricter than the issue's
"all-or-nothing per icon" rule and avoids visually mixed screens.

Because icons are shared across screens, one screen's icons can also appear on another.
Migrating a shared icon ripples to every screen that uses it. To keep each per-screen phase
self-contained, **shared icons are migrated first, in one phase**; after that, each screen
phase only touches icons unique to that screen, so it can't leave another screen mixed.
(Intermediate mixing on the integration branch is fine — nothing reaches users until the
final PR to `main`.)

| Phase | Scope | Content |
|-------|-------|---------|
| **0 — Foundation** ✅ | tooling | Decision record, codegen (`scripts/icons/`), seed mapping table, Storybook gallery. **No icon art changes.** |
| **1 — Shared icons** | cross-screen | Every icon used on more than one screen (nav, back, close, search, wallet, copy…). One PR, ripples across all screens by design. Excludes chevrons. |
| **2 — Main View** | screen | Portfolio / vault home — its remaining screen-unique icons. |
| **3 — Send flow** | screen | |
| **4 — Swap flow** | screen | |
| **5 — DeFi / Earn** | screen | |
| **6 — Settings** | screen | |
| **7 — Transaction History** | screen | |
| **8 — Vault lifecycle** | screens | Onboarding, Vault Setup, Reshare, Upgrade Vault (share most icons — grouped). |
| **9 — Notifications** | screen | |
| **10 — Extension surfaces** | screens | No Figma reference — migrate to desktop parity. |
| separate track | brand | ~23 Vultisig-specific/bespoke glyphs (`Agent*`, `Tron*`, tier badges…) — design call, likely stay bespoke. |
| separate track | cleanup | `iconStyle` ternary removal + relocating non-icon Station styling to a brand flag. |
| follow-up | infra | Barrel (`index.ts`) + expand the gallery — tracked separately (#4383 note). |

Screen list and the mapping source (iOS precedent, V3 library, ambiguous) still drive
*which* V3 icon each legacy icon becomes — see `scripts/icons/icon-mapping.json`. The
screen split only changes *how the work is batched into PRs*.

**Chevrons stay on the legacy pack on purpose** (design-confirmed) and are excluded from
the migration entirely.

## Constraints that shape the work

- **`knip` runs in `check:all`.** With no barrel, orphaned icons surface as unused exports —
  a partial migration fails CI. Migrate **all-or-nothing per icon** (in-place body swap
  keeps the name, so no orphans are created).
- **Every swap needs visual verification** in the gallery/app. A name match is not a glyph
  match. Nothing is zero-touch.
- **Estimates are heuristic** (name matching), not ground truth — confirm each against
  rendered art before shipping.
