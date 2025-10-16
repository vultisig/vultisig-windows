import { VultDiscountTier } from '@core/chain/swap/affiliate/config'
import { HStack, hStack } from '@lib/ui/layout/Stack'
import { OnClickProp, ValueProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { t } from 'i18next'
import styled from 'styled-components'

import { DiscountTierBps } from './bps'
import { discountTierIcons } from './icons'

const Container = styled.div`
  ${hStack({
    alignItems: 'center',
    justifyContent: 'space-between',
  })}
`

export const VultDiscountTierHeader = ({
  value,
  onClick,
}: ValueProp<VultDiscountTier> & Partial<OnClickProp>) => {
  const Icon = discountTierIcons[value]

  return (
    <Container
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : undefined}
    >
      <HStack alignItems="center" gap={12}>
        <Icon fontSize={40} />
        <Text size={28} weight="500">
          {t(value)}
        </Text>
      </HStack>
      <DiscountTierBps value={value} />
    </Container>
  )
}
