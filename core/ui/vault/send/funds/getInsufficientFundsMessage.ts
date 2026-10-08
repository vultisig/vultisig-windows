import { toExactAmountString } from '@core/ui/vault/deposit/utils/exactAmountString'
import { BuildKeysignPayloadShortfall } from '@vultisig/core-mpc/keysign/error'
import { TFunction } from 'i18next'

// Exact, so "needs" is never rounded down to what the vault holds.
const formatExactAmount = (value: bigint, decimals: number, ticker: string) =>
  `${toExactAmountString(value, decimals)} ${ticker}`

/** Names the exact asset a send is short of, how much it needs and how much is there. */
export const getInsufficientFundsMessage = (
  shortfall: BuildKeysignPayloadShortfall,
  t: TFunction
): string => {
  const { required, available, ticker, decimals, includesNetworkCosts } =
    shortfall

  return t(
    includesNetworkCosts
      ? 'insufficient_funds_including_network_costs'
      : 'insufficient_funds_asset',
    {
      ticker,
      required: formatExactAmount(required, decimals, ticker),
      available: formatExactAmount(available, decimals, ticker),
    }
  )
}
