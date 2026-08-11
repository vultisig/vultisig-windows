import { css } from 'styled-components'

/**
 * `pill` is a bound, not a size. CSS clamps a corner radius to half the
 * smaller dimension, and that clamp is what produces the capsule, so the
 * number only has to out-run any surface the app can render.
 */
const pillPx = 100000

/**
 * The scale as raw numbers, for surfaces that round their corners
 * individually - a bottom sheet rounding only its top two, for instance.
 * Prefer `borderRadius`, which rounds all four and is what almost every
 * surface wants.
 */
export const borderRadiusPx = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: pillPx,
} as const

const radius = (px: number) => css`
  border-radius: ${px}px;
`

/**
 * The app's corner-radius scale.
 *
 * Steps are named by size, not by surface: `md` means "12 from the scale",
 * nothing more. Which surface class takes which step is documentation, not a
 * contract, so a surface that genuinely reads differently can pick another
 * step without the token name lying about it:
 *
 * - `xs` (4) progress tracks, skeleton bars, hairline chips
 * - `sm` (8) small inline tags
 * - `md` (12) list rows, compact containers
 * - `lg` (16) input fields, inner icon tiles
 * - `xl` (24) cards, banners, list containers, sheets and modals
 * - `pill` any capsule control
 *
 * The scale stops at 24 and has no separate sheet step - sheets take `xl`,
 * which is already the radius most of them render at.
 *
 * There is no circle step either. On a square surface `pill` renders a circle;
 * on a non-square one it renders a stadium, which is the right shape for a
 * capsule and a bug for anything that meant to be an ellipse. Check the
 * surface is square before reaching for it.
 */
export const borderRadius = {
  xs: radius(borderRadiusPx.xs),
  sm: radius(borderRadiusPx.sm),
  md: radius(borderRadiusPx.md),
  lg: radius(borderRadiusPx.lg),
  xl: radius(borderRadiusPx.xl),
  pill: radius(borderRadiusPx.pill),
  /** @deprecated 8 - use `sm`. */
  s: radius(borderRadiusPx.sm),
  /** @deprecated 12 - use `md`. */
  m: radius(borderRadiusPx.md),
  /**
   * @deprecated 20 - off the scale entirely. Pick `lg` (16) or `xl` (24) by
   * looking at the surface: there is no mechanical answer, and renaming this
   * to `lg` would silently shrink every call site by 4px.
   */
  l: radius(20),
}
