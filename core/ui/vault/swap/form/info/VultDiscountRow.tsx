import { discountTierIcons } from '@core/ui/vult/discount/tier/icons'
import { vult } from '@vultisig/core-chain/coin/knownTokens'
import { VultDiscountTier } from '@vultisig/core-chain/swap/affiliate/config'
import { useTranslation } from 'react-i18next'

import { formatAffiliateBpsPercent } from '../../affiliate/affiliateBps'
import { DiscountLabel } from './DiscountLabel'
import { SwapFeeRowRenderer } from './swapFeeRow'

type VultDiscountRowProps = {
  renderRow: SwapFeeRowRenderer
  tier: VultDiscountTier
  /** Rate this tier takes off the list rate, in basis points. */
  bps: number
}

/**
 * Reports a VULT tier as the share of the swap it waives, in the same unit the
 * fee row above states its list rate. Expressing it as a portion of the fee
 * instead reads as a fee of its own when the base is nowhere on screen.
 */
export const VultDiscountRow = ({
  renderRow,
  tier,
  bps,
}: VultDiscountRowProps) => {
  const { t } = useTranslation()
  const Icon = discountTierIcons[tier]

  return (
    <>
      {renderRow({
        label: (
          <DiscountLabel icon={<Icon />}>
            {`${vult.ticker} ${t(tier)}: ${formatAffiliateBpsPercent(bps)}`}
          </DiscountLabel>
        ),
        value: null,
      })}
    </>
  )
}
