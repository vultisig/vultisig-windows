import { css } from 'styled-components'

/**
 * @deprecated Use `borderRadius.pill`. 1000px stops rounding a surface wider
 * than 2000px, and it is one of five spellings of "fully rounded" in the tree;
 * the token collapses them and raises the bound past anything renderable.
 */
export const round = css`
  border-radius: 1000px;
`
