import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { CoinKey } from '@vultisig/core-chain/coin/Coin'
import { getNativeSwapDecimals } from '@vultisig/core-chain/swap/native/utils/getNativeSwapDecimals'
import { KeysignSwapPayload } from '@vultisig/core-mpc/keysign/swap/KeysignSwapPayload'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'

type ToNativeSwapLimitAmountInput = {
  rawLimit: string | null | undefined
  toCoin: CoinKey
}

/**
 * Converts a raw native-swap limit into a positive human decimal amount.
 *
 * `to_amount_limit` is stored in the swap API's base units (THORChain's 8-decimal
 * standard, or MayaChain's native precision) — the same precision that produced
 * `toAmountDecimal` — so it must be scaled by `getNativeSwapDecimals`, not shown
 * raw. Returns `null` when the limit is absent, zero, or unparseable, so callers
 * can hide the "min. payout" row.
 */
export const toNativeSwapLimitAmount = ({
  rawLimit,
  toCoin,
}: ToNativeSwapLimitAmountInput): number | null => {
  if (!rawLimit) {
    return null
  }

  const amount = fromChainAmount(rawLimit, getNativeSwapDecimals(toCoin))

  return amount > 0 ? amount : null
}

type GetSwapToAmountLimitInput = {
  swapPayload: KeysignSwapPayload
  toCoin: CoinKey
}

/**
 * Resolves the guaranteed minimum swap output ("min. payout") as a human decimal
 * number. Only native (THORChain/MayaChain) swaps carry a real floor —
 * `to_amount_limit` in the signed payload, derived from the slippage tolerance
 * sent with the quote. General aggregator swaps (1inch, SwapKit, CowSwap) expose
 * no separate limit, so this returns `null` for them.
 */
export const getSwapToAmountLimit = ({
  swapPayload,
  toCoin,
}: GetSwapToAmountLimitInput): number | null => {
  const rawLimit = matchRecordUnion<KeysignSwapPayload, string | null>(
    swapPayload,
    {
      native: ({ toAmountLimit }) => toAmountLimit,
      general: () => null,
    }
  )

  return toNativeSwapLimitAmount({ rawLimit, toCoin })
}
