import { discountTierIcons } from '@core/ui/vult/discount/tier/icons'
import { vult } from '@vultisig/core-chain/coin/knownTokens'
import { VultDiscountTier } from '@vultisig/core-chain/swap/affiliate/config'
import { SwapFee } from '@vultisig/core-chain/swap/SwapFee'
import { useTranslation } from 'react-i18next'

import { formatDiscountPercentOfBaseFee } from '../../affiliate/affiliateBps'
import { DiscountLabel } from './DiscountLabel'
import { SwapDiscountAmount } from './SwapDiscountAmount'
import { SwapFeeRowRenderer } from './swapFeeRow'

type VultDiscountRowProps = {
  renderRow: SwapFeeRowRenderer
  tier: VultDiscountTier
  /** Rate this tier takes off the list rate, in basis points. */
  bps: number
  /** What the tier takes off the fee row above. */
  fee: SwapFee
}

/**
 * Reports a VULT tier as the share of the base swap fee it waives, and as the
 * money that share takes off the fee row above.
 */
export const VultDiscountRow = ({
  renderRow,
  tier,
  bps,
  fee,
}: VultDiscountRowProps) => {
  const { t } = useTranslation()
  const Icon = discountTierIcons[tier]

  return (
    <>
      {renderRow({
        label: (
          <DiscountLabel icon={<Icon />}>
            {`${vult.ticker} ${t(tier)}: ${formatDiscountPercentOfBaseFee(bps)}`}
          </DiscountLabel>
        ),
        value: <SwapDiscountAmount value={fee} />,
      })}
    </>
  )
}
