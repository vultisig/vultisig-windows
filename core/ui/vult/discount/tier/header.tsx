import { VultDiscountTier } from '@core/chain/swap/affiliate/config'
import { HStack, hStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
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
  width: 100%;
`

export const VultDiscountTierHeader = ({
  value,
}: ValueProp<VultDiscountTier>) => {
  const Icon = discountTierIcons[value]

  return (
    <Container>
      <HStack alignItems="center" gap={12}>
        <Icon fontSize={36} />
        <Text size={22} weight="500">
          {t(value)}
        </Text>
      </HStack>
      <DiscountTierBps value={value} />
    </Container>
  )
}
