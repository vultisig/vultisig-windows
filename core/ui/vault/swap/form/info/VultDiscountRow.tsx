import { vult } from '@core/chain/coin/knownTokens'
import {
  VultDiscountTier,
  vultDiscountTierBps,
} from '@core/chain/swap/affiliate/config'
import { discountTierIcons } from '@core/ui/vult/discount/tier/icons'
import { ValueProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'
import styled, { keyframes } from 'styled-components'

import { DiscountRow } from './DiscountRow'

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`

const RotatingIcon = styled.span`
  display: inline-flex;
  animation: ${rotate} 10s linear infinite;
`

export const VultDiscountRow = ({ value: tier }: ValueProp<VultDiscountTier>) => {
  const { t } = useTranslation()
  const Icon = discountTierIcons[tier]
  const bps = vultDiscountTierBps[tier]

  return (
    <DiscountRow
      icon={
        <RotatingIcon>
          <Icon />
        </RotatingIcon>
      }
    >
      {vult.ticker} ({t(tier)} -{bps} bps)
    </DiscountRow>
  )
}
