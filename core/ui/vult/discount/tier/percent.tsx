import { borderRadius } from '@lib/ui/css/borderRadius'
import { ValueProp } from '@lib/ui/props'
import { getColor } from '@lib/ui/theme/getters'
import {
  VultDiscountTier,
  vultDiscountTierBps,
} from '@vultisig/core-chain/swap/affiliate/config'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { formatDiscountPercentOfBaseFee } from '../../../vault/swap/affiliate/affiliateBps'

const Container = styled.div`
  display: inline-flex;
  padding: 7px 9px;
  justify-content: center;
  align-items: center;
  ${borderRadius.lg};
  border: 1px solid ${getColor('foregroundExtra')};

  color: #f0f4fc;
  font-family: Brockmann;
  font-size: 13px;
  font-style: normal;
  font-weight: 500;
  letter-spacing: 0.06px;
  line-height: 18px;
`

/** Pill stating the share of the base swap fee a tier waives. */
export const DiscountTierPercent = ({ value }: ValueProp<VultDiscountTier>) => {
  const { t } = useTranslation()

  return (
    <Container>
      {value === 'ultimate'
        ? t('complete_fee_waive')
        : `${t('swap_discount')}: ${formatDiscountPercentOfBaseFee(vultDiscountTierBps[value])}`}
    </Container>
  )
}
