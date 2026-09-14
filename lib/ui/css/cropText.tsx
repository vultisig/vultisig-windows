import { css } from 'styled-components'

/**
 * Truncates one line of text with an ellipsis.
 *
 * Includes `min-width: 0` because a flex item's default `min-width: auto`
 * floors it at its content width, which would keep the ellipsis from ever
 * being reached inside a row. This covers the text itself; a wrapper between
 * it and the row needs `shrinkable` for the same reason.
 */
export const cropText = css`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
`
