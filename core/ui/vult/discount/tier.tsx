import {
  VultDiscountTier as VultDiscountTierType,
  vultDiscountTierDiscounts,
} from '@core/chain/swap/affiliate/config'
import { toSizeUnit } from '@lib/ui/css/toSizeUnit'
import { HStack } from '@lib/ui/layout/Stack'
import { SvgProps, ValueProp } from '@lib/ui/props'
import { Text, text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { BronzeIcon } from './icons/bronze'
import { GoldIcon } from './icons/gold'
import { PlatinumIcon } from './icons/platinum'
import { SilverIcon } from './icons/silver'

const containerBorderRadius = 16

const gradientColors: Record<VultDiscountTierType, [string, string]> = {
  bronze: ['hsla(16, 71%, 51%, 1)', 'hsla(215, 69%, 53%, 0.21)'],
  silver: ['hsla(215, 40%, 85%, 1)', 'hsla(215, 69%, 53%, 0.22)'],
  gold: ['hsla(38, 100%, 68%, 1)', 'hsla(215, 69%, 53%, 0.2)'],
  platinum: ['hsla(167, 78%, 55%, 1)', 'hsla(224, 98%, 64%, 1)'],
}

const Container = styled.div<ValueProp<VultDiscountTierType>>`
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

const DiscountBadge = styled.div`
  border-radius: 16px;
  padding: 8px 10px;
  border: 1px solid ${getColor('foregroundSuper')};
  ${text({
    size: 13,
    weight: 500,
  })}
`

const icons: Record<VultDiscountTierType, React.FC<SvgProps>> = {
  bronze: BronzeIcon,
  silver: SilverIcon,
  gold: GoldIcon,
  platinum: PlatinumIcon,
}

export const VultDiscountTier = ({
  value,
}: ValueProp<VultDiscountTierType>) => {
  const { t } = useTranslation()
  const Icon = icons[value]

  return (
    <Container value={value}>
      <HStack alignItems="center" justifyContent="space-between">
        <HStack alignItems="center" gap={12}>
          <Icon fontSize={40} />
          <Text size={28} weight="500">
            {t(value)}
          </Text>
        </HStack>
        <DiscountBadge>
          {t('discount')}: {vultDiscountTierDiscounts[value]}bps
        </DiscountBadge>
      </HStack>
    </Container>
  )
}
