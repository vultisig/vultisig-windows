import { VultDiscountTier } from '@core/chain/swap/affiliate/config'
import { toSizeUnit } from '@lib/ui/css/toSizeUnit'
import { ValueProp } from '@lib/ui/props'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

import { discountTierColors } from './colors'

const containerBorderRadius = 16

const gradientColors: Record<VultDiscountTier, [string, string]> = {
  bronze: ['hsla(16, 71%, 51%, 1)', 'hsla(215, 69%, 53%, 0.21)'],
  silver: [discountTierColors.silver.toCssValue(), 'hsla(215, 69%, 53%, 0.22)'],
  gold: [discountTierColors.gold.toCssValue(), 'hsla(215, 69%, 53%, 0.2)'],
  platinum: ['hsla(167, 78%, 55%, 1)', 'hsla(224, 98%, 64%, 1)'],
}

export const DiscountTierContainer = styled.div<ValueProp<VultDiscountTier>>`
  border-radius: ${toSizeUnit(containerBorderRadius)};
  background: ${getColor('mistExtra')};
  padding: 1px;
  overflow: hidden;

  background: linear-gradient(
    180deg,
    ${({ value }) => gradientColors[value].join(', ')}
  );

  > * {
    padding: 16px;
    background: ${getColor('foreground')};
  }

  > *:nth-child(1) {
    border-top-left-radius: ${toSizeUnit(containerBorderRadius)};
    border-top-right-radius: ${toSizeUnit(containerBorderRadius)};
  }

  > *:last-child {
    border-bottom-left-radius: ${toSizeUnit(containerBorderRadius)};
    border-bottom-right-radius: ${toSizeUnit(containerBorderRadius)};
  }

  > *:nth-child(2) {
    padding-top: 0;
  }
`
