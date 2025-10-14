import {
  VultDiscountTier as VultDiscountTierType,
  vultDiscountTierDiscounts,
} from '@core/chain/swap/affiliate/config'
import { HStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { Text, text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const Container = styled.div`
  border-radius: 16px;
  background: ${getColor('mistExtra')};
  border: 1px solid #db5727;
  box-shadow: 0 4px 16.6px 0 rgba(219, 87, 39, 0.07) inset;

  > * {
    padding: 16px;
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

export const VultDiscountTier = ({
  value,
}: ValueProp<VultDiscountTierType>) => {
  const { t } = useTranslation()
  return (
    <Container>
      <HStack alignItems="center" justifyContent="space-between">
        <HStack alignItems="center" gap={12}>
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
