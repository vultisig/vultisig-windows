import { SettingsBaselineText } from '@core/ui/settings/SettingsBaselineText'
import { ValueProp } from '@lib/ui/props'
import { vult } from '@vultisig/core-chain/coin/knownTokens'
import {
  VultDiscountTier,
  vultDiscountTierMinBalances,
} from '@vultisig/core-chain/swap/affiliate/config'
import { formatAmount } from '@vultisig/lib-utils/formatAmount'

/** The $VULT balance a tier asks for. */
export const DiscountTierMinBalance = ({
  value,
}: ValueProp<VultDiscountTier>) => (
  <SettingsBaselineText variant="stationBodyS">
    {formatAmount(vultDiscountTierMinBalances[value], {
      ticker: `$${vult.ticker}`,
    })}
  </SettingsBaselineText>
)
