import { IsActiveProp } from '@lib/ui/props'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

import { centerContent } from '../../css/centerContent'
import { round } from '../../css/round'
import { sameDimensions } from '../../css/sameDimensions'
import { toSizeUnit } from '../../css/toSizeUnit'
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
