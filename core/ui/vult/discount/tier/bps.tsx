import { ValueProp } from '@lib/ui/props'
import {
  VultDiscountTier,
  vultDiscountTierBps,
} from '@vultisig/core-chain/swap/affiliate/config'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const Container = styled.div`
  display: inline-flex;
  padding: 8px 16px;
  justify-content: center;
  align-items: center;
  border-radius: 99px;
  border: 1px solid rgba(72, 121, 253, 0.32);

  color: #f0f4fc;
  font-family: Brockmann;
  font-size: 14px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px;
`

export const DiscountTierBps = ({ value }: ValueProp<VultDiscountTier>) => {
  const { t } = useTranslation()

  return (
    <Container>
      {value === 'ultimate'
        ? t('complete_fee_waive')
        : `${t('swap_discount')}: ${vultDiscountTierBps[value]}bps`}
    </Container>
  )
}
