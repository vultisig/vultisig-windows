import { css } from 'styled-components'

/**
 * Lets a flex or grid item shrink below its content width.
 *
 * A flex item defaults to `min-width: auto`, which floors it at the intrinsic
 * width of its contents. A wrapper carrying that floor cannot shrink, so text
 * inside it never reaches its own ellipsis and the row overflows instead.
 * Apply this to every wrapper between a row and the text that must crop.
 */
export const shrinkable = css`
  min-width: 0;
`
