import { discountTierIcons } from '@core/ui/vult/discount/tier/icons'
import { vult } from '@vultisig/core-chain/coin/knownTokens'
import { VultDiscountTier } from '@vultisig/core-chain/swap/affiliate/config'
import { SwapFee } from '@vultisig/core-chain/swap/SwapFee'
import { useTranslation } from 'react-i18next'

import { getVultDiscountSavingBps } from '../../affiliate/affiliateBps'
import { DiscountLabel } from './DiscountLabel'
import { SwapFeeRowRenderer } from './swapFeeRow'
import { SwapFeeFiatValue } from './SwapTotalFeeFiatValue'

type VultDiscountRowProps = {
  renderRow: SwapFeeRowRenderer
  tier: VultDiscountTier
  /** Fee this tier waived, omitted when it cannot be valued from the quote. */
  saving?: SwapFee
}

/**
 * Reports a VULT tier as the basis points it takes off the base affiliate rate.
 * Stating the discount as a share of the base fee instead reads as a fee of its
 * own when the base is nowhere on screen.
 */
export const VultDiscountRow = ({
  renderRow,
  tier,
  saving,
}: VultDiscountRowProps) => {
  const { t } = useTranslation()
  const Icon = discountTierIcons[tier]

  return (
    <>
      {renderRow({
        label: (
          <DiscountLabel icon={<Icon />}>
            {`${vult.ticker} (${t(tier)} -${getVultDiscountSavingBps(tier)} bps)`}
          </DiscountLabel>
        ),
        value: saving ? (
          <>
            −<SwapFeeFiatValue value={[saving]} />
          </>
        ) : null,
      })}
    </>
  )
}
