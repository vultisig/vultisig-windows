import { CoinKey } from '@vultisig/core-chain/coin/Coin'
import { getNativeSwapDecimals } from '@vultisig/core-chain/swap/native/utils/getNativeSwapDecimals'
import { SwapQuoteResult } from '@vultisig/core-chain/swap/quote/SwapQuote'
import { SwapFee } from '@vultisig/core-chain/swap/SwapFee'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'

type GetSwapQuoteOutputInput = {
  quote: SwapQuoteResult
  toCoinKey: CoinKey
  toCoinDecimals: number
}

/**
 * The destination-token payout a quote promises, in base units. Native quotes
 * report it in the swap API's own precision rather than the token's, so the
 * denomination travels with the amount instead of being assumed by callers.
 */
export const getSwapQuoteOutput = ({
  quote,
  toCoinKey,
  toCoinDecimals,
}: GetSwapQuoteOutputInput): SwapFee =>
  matchRecordUnion<SwapQuoteResult, SwapFee>(quote, {
    native: ({ expected_amount_out }) => ({
      ...toCoinKey,
      amount: BigInt(expected_amount_out),
      decimals: getNativeSwapDecimals(toCoinKey),
    }),
    general: ({ dstAmount }) => ({
      ...toCoinKey,
      amount: BigInt(dstAmount),
      decimals: toCoinDecimals,
    }),
  })
