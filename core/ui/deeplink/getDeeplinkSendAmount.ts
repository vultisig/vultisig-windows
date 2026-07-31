import { toChainAmount } from '@vultisig/core-chain/amount/toChainAmount'

type GetDeeplinkSendAmountInput = {
  amount: string
  decimals: number
}

/**
 * Converts a deeplink amount string to chain base units.
 * The string must be parsed exactly — a float64 round-trip would corrupt
 * amounts with more than ~15 significant digits (#4491).
 */
export const getDeeplinkSendAmount = ({
  amount,
  decimals,
}: GetDeeplinkSendAmountInput) => toChainAmount(Number(amount), decimals)
