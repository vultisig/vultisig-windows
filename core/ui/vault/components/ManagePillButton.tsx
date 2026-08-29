import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { hStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

/**
 * Pill-shaped trigger (icon + label) used for chain/token management buttons.
 */
export const ManagePillButton = styled(UnstyledButton)`
  ${hStack({ alignItems: 'center', gap: 8 })};
  ${borderRadius.pill};
  height: 40px;
  padding: 12px;
  color: ${getColor('contrast')};
  background: ${getColor('foreground')};
  box-shadow: inset 0 0 8px rgba(240, 244, 252, 0.03);
`
