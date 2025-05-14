import { round } from '@lib/ui/css/round'
import { toSizeUnit } from '@lib/ui/css/toSizeUnit'
import { matchColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

import { getSwitchWidth, switchConfig, SwitchSize } from './config'

export const SwitchContainer = styled.div<{
  isActive: boolean
  size: SwitchSize
}>`
  width: ${({ size }) => toSizeUnit(getSwitchWidth(size))};
  height: ${({ size }) => toSizeUnit(switchConfig.height[size])};
  background: ${matchColor('isActive', {
    true: 'success',
    false: 'mistExtra',
  })};

  display: flex;
  align-items: center;

  position: relative;

  flex-shrink: 0;

  ${round};
`
