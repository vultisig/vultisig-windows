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

All work lands on the long-lived integration branch `feature/icons-v3-adoption` (off
`main`, no direct PRs). Each phase is its own PR **targeting that branch**, not `main`.

| Phase | Branch | Content |
|-------|--------|---------|
| **0 — Foundation** (this PR) | `feature/icons-v3-phase-0-foundation` | Decision record, codegen tooling (`scripts/icons/`), seed mapping table, Storybook gallery. **No icon art changes.** |
| 1–4 — iOS-precedent batch | per phase | ~102 icons with an iOS V3 precedent, grouped by V3 category (~25/PR). |
| 5 — Brand/social glyphs | | Facebook / Twitter / LinkedIn / Reddit / WhatsApp … (iOS ships these separately). |
| 6 — V3, no iOS precedent | | ~35 icons we choose + verify ourselves (mostly trivial). |
| 7 — Ambiguous | | ~24 icons resolved by hand against rendered art, with design sign-off. |
| separate track | | ~23 Vultisig-specific/bespoke glyphs (`Agent*`, `Tron*`, tier badges …) — a design conversation, likely stay bespoke. |
| separate track | | `iconStyle` ternary removal + relocating non-icon Station styling to a brand flag. |
| follow-up | | Barrel (`index.ts`) + expand the gallery — tracked separately (#4383 note). |

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
