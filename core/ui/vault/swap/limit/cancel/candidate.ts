import { LimitSwapCancelCandidate } from '@vultisig/core-chain/swap/native/limitSwapCancelEligibility'
import { parseLimitSwapMemo } from '@vultisig/core-chain/swap/native/limitSwapMemo'
import {
  getThorchainCancelMemoAsset,
  getThorchainMemoAsset,
} from '@vultisig/core-chain/swap/native/thorchainMemoAsset'
import { attempt, withFallback } from '@vultisig/lib-utils/attempt'

import { LimitSwapTransactionData } from '../../../../transaction-history/core'
import { toThorchainFixedPoint } from '../amount'
import { isLiveLimitOrderStatus } from '../tracking/reconcile'

/**
 * Optional bigint from a stored decimal string, dropping anything unparseable.
 *
 * Undefined and unparseable are deliberately the same answer here: both mean
 * "this value proves nothing", and eligibility already treats an absent field as
 * not-yet-known rather than as agreement.
 */
const toOptionalBigint = (value: string | undefined): bigint | undefined => {
  // `BigInt('')` is `0n`, not a throw — so an empty stored amount would sail
  // past this as a real zero, short-circuit the `??` that falls back to the
  // derived value, and block an otherwise cancellable order as
  // `missingSignedData`. Blank has to mean unknown.
  const trimmed = value?.trim()
  if (!trimmed) {
    return undefined
  }

  return withFallback(
    attempt(() => BigInt(trimmed)),
    undefined
  )
}

/**
 * Everything the SDK needs to decide whether a stored limit order can be
 * cancelled, read off the record.
 *
 * The two "signed" amounts are derived when the record predates them being
 * captured, which is safe because both derivations are exact rather than
 * approximate: the deposit is the signed source amount rescaled into THORChain's
 * 1e8 (the same conversion THORChain applies on the way in), and the trade target
 * is the LIM inside the order's own memo — the string THORChain executed. Without
 * this, every order placed before cancelling shipped would be permanently
 * uncancellable despite the record holding exactly what a cancel needs.
 *
 * The source asset is likewise derived from the funding coin rather than read
 * back from the memo: a placement memo names only the TARGET, because THORChain
 * infers the source from the coin that arrived. Both spellings are supplied —
 * the abbreviated one as the "stored" reading and the full one as the "signed"
 * reading — so the SDK's asset resolution can cross-check them against the
 * queue exactly as it does for the target.
 */
export const toLimitSwapCancelCandidate = (
  data: LimitSwapTransactionData
): LimitSwapCancelCandidate => {
  const coin = {
    chain: data.fromChain,
    id: data.fromTokenId,
    ticker: data.fromToken,
  }

  const signedSourceAmount =
    toOptionalBigint(data.signedSourceAmount) ??
    withFallback(
      attempt(() =>
        toThorchainFixedPoint({
          amount: BigInt(data.fromAmount),
          decimals: data.fromDecimals,
        })
      ),
      undefined
    )

  const signedTradeTarget =
    toOptionalBigint(data.signedTradeTarget) ??
    withFallback(
      attempt(() => parseLimitSwapMemo(data.memo).limit),
      undefined
    )

  // An unspellable source asset falls back to empty rather than throwing: the
  // SDK reads that as "no local spelling" and can still resolve the order from
  // the queue's own report.
  const storedSourceAsset = withFallback(
    attempt(() => getThorchainMemoAsset(coin)),
    ''
  )
  const signedSourceAsset =
    data.signedSourceAsset ??
    withFallback(
      attempt(() => getThorchainCancelMemoAsset(coin)),
      undefined
    )

  return {
    isTerminal: !isLiveLimitOrderStatus(data.orderStatus),
    hasPendingCancel: Boolean(data.cancelTxHash),
    sourceAsset: storedSourceAsset,
    targetAsset: data.targetAsset,
    signedSourceAsset,
    signedSourceAmount,
    signedTradeTarget,
    observedSourceAsset: data.observedSourceAsset,
    observedTargetAsset: data.observedTargetAsset,
    observedDeposit: toOptionalBigint(data.deposit),
    observedTradeTarget: toOptionalBigint(data.observedTradeTarget),
  }
}
