import { getColor } from '@lib/ui/theme/getters'
import { css } from 'styled-components'

/** Layout and fill of one row on the Security page's card. */
export const securityRow = css`
  align-items: center;
  background: ${getColor('foreground')};
  display: flex;
  gap: 12px;
  justify-content: space-between;
  padding: 16px;
  width: 100%;
`
