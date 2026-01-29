import { vult } from '@core/chain/coin/knownTokens'
import {
  VultDiscountTier,
  vultDiscountTierMinBalances,
} from '@core/chain/swap/affiliate/config'
import { VStack } from '@lib/ui/layout/Stack'
import { ValueProp } from '@lib/ui/props'
import { formatAmount } from '@lib/utils/formatAmount'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const StakeLabel = styled.span`
  color: #8295ae;
  font-family: Brockmann;
  font-size: 13px;
  font-weight: 500;
  line-height: 18px;
  letter-spacing: 0.06px;
`

const StakeAmount = styled.span`
  color: #f0f4fc;
  font-family: 'Satoshi Variable';
  font-size: 14px;
  font-weight: 550;
  line-height: 20px;
  letter-spacing: 0.2px;
`

export const DiscountTierMinBalance = ({
  value,
}: ValueProp<VultDiscountTier>) => {
  const { t } = useTranslation()
  return (
    <VStack gap={4}>
      <StakeLabel>{t('stake')}</StakeLabel>
      <StakeAmount>
        {formatAmount(vultDiscountTierMinBalances[value], {
          ticker: `$${vult.ticker}`,
        })}
      </StakeAmount>
    </VStack>
  )
}
