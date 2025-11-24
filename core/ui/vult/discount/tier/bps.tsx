import {
  VultDiscountTier,
  vultDiscountTierBps,
} from '@core/chain/swap/affiliate/config'
import { ValueProp } from '@lib/ui/props'
import { text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const Container = styled.div`
  border-radius: 16px;
  padding: 8px 10px;
  border: 1px solid ${getColor('foregroundSuper')};
  ${text({
    size: 13,
    weight: 500,
  })}
`

export const DiscountTierBps = ({ value }: ValueProp<VultDiscountTier>) => {
  const { t } = useTranslation()

  return (
    <Container>
      {t('discount')}: {vultDiscountTierBps[value]}bps
    </Container>
  )
}
