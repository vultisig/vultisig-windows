import {
  VultDiscountTier,
  vultDiscountTierBps,
} from '@core/chain/swap/affiliate/config'
import { ValueProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const Container = styled.div`
  display: flex;
  padding: 8px 10px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 16px;
  border: 1px solid #1b3f73;
  background: #11284a;

  color: #f0f4fc;
  font-family: Brockmann;
  font-size: 13px;
  font-style: normal;
  font-weight: 500;
  line-height: 18px;
  letter-spacing: 0.06px;
`

export const DiscountTierBps = ({ value }: ValueProp<VultDiscountTier>) => {
  const { t } = useTranslation()

  return (
    <Container>
      {value === 'ultimate' ? (
        t('complete_fee_waive')
      ) : (
        <>
          {t('discount')}: {vultDiscountTierBps[value]}bps
        </>
      )}
    </Container>
  )
}
