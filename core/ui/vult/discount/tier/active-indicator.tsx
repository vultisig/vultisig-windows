import { CheckIcon } from '@lib/ui/icons/CheckIcon'
import { ValueProp } from '@lib/ui/props'
import { VultDiscountTier } from '@vultisig/core-chain/swap/affiliate/config'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import {
  discountTierFooterBackground,
  discountTierFooterOverlap,
} from './container'

const Container = styled.div<ValueProp<VultDiscountTier>>`
  display: flex;
  align-self: stretch;
  padding: ${discountTierFooterOverlap + 14}px 14px 14px;
  justify-content: center;
  align-items: center;
  gap: 8px;
  border-radius: 16px;

  background: ${({ value }) => discountTierFooterBackground(value)};

  color: #f0f4fc;
  text-align: center;
  font-family: Brockmann;
  font-size: 16px;
  font-weight: 600;
  line-height: 22px;
`

export const ActiveDiscountTierFooter = ({
  value,
}: ValueProp<VultDiscountTier>) => {
  const { t } = useTranslation()
  return (
    <Container value={value}>
      <CheckIcon fontSize={18} />
      {t('active')}
    </Container>
  )
}
