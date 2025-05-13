import { centerContent } from '@lib/ui/css/centerContent'
import { round } from '@lib/ui/css/round'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { toSizeUnit } from '@lib/ui/css/toSizeUnit'
import { IsActiveProp } from '@lib/ui/props'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

import {
  getControlSize,
  getSwitchWidth,
  switchConfig,
  SwitchSize,
} from './config'

export const SwitchControl = styled.div<IsActiveProp & { size: SwitchSize }>`
  ${({ size }) => sameDimensions(getControlSize(size))};
  margin-left: ${({ isActive, size }) =>
    toSizeUnit(
      isActive
        ? getSwitchWidth(size) - getControlSize(size) - switchConfig.spacing
        : switchConfig.spacing
    )};

  ${round};

  ${centerContent};
  color: ${getColor('background')};

  background: ${getColor('contrast')};
  font-size: 14px;
`
