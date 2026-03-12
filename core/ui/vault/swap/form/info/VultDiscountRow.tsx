import { vult } from '@core/chain/coin/knownTokens'
import {
  VultDiscountTier,
  vultDiscountTierBps,
} from '@core/chain/swap/affiliate/config'
import { discountTierIcons } from '@core/ui/vult/discount/tier/icons'
import { ValueProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

import { formatDiscountPercentOfBaseFee } from './discountPercent'
import { DiscountRow } from './DiscountRow'

export const VultDiscountRow = ({
  value: tier,
}: ValueProp<VultDiscountTier>) => {
  const { t } = useTranslation()
  const Icon = discountTierIcons[tier]
  const bps = vultDiscountTierBps[tier]
  const discountPercent = formatDiscountPercentOfBaseFee(bps)

  return (
    <DiscountRow icon={<Icon />}>
      {vult.ticker} {t(tier)}: {discountPercent}
    </DiscountRow>
  )
}
