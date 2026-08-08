import { areLimitOrdersCancelIndistinguishable } from '@vultisig/core-chain/swap/native/limitSwapCancelBucket'
import { getLimitSwapCancelEligibility } from '@vultisig/core-chain/swap/native/limitSwapCancelEligibility'
import { parseCancelLimitSwapMemo } from '@vultisig/core-chain/swap/native/limitSwapCancelMemo'
import { getKeysignCoin } from '@vultisig/core-mpc/keysign/utils/getKeysignCoin'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { attempt } from '@vultisig/lib-utils/attempt'

import { toLimitSwapCancelCandidate } from '../../vault/swap/limit/cancel/candidate'
import { LimitSwapTransactionRecord, TransactionRecord } from '../core'

type ApplyLimitOrderCancelInput = {
  records: TransactionRecord[]
  payload: KeysignPayload
  /** The broadcast cancel transaction's hash. */
  txHash: string
}

/**
 * Attach a broadcast cancellation to the order it addresses, or `null` when the
 * payload is not a cancellation.
 *
 * A cancel gets no history row of its own: it is a step in this order's life,
 * not a separate transfer, and a second row showing a dust send to an inbound
 * vault would read as an unexplained outgoing payment. The order it belongs to
 * is the single surface for the whole lifecycle.
 *
 * The target is found the way THORChain finds it — by the bucket the memo
 * addresses, plus the sender — because that is the only identity a cancel has.
 * There is no tx hash linking the two. When several resting orders share that
 * bucket the OLDEST is marked, matching which one THORChain will actually close;
 * the verify screen has already warned that this cancel cannot pick between
 * them.
 *
 * The order is not marked cancelled here, only *cancel-sent*: THORChain has to
 * observe and accept the memo first, and the tracker closes the order when the
 * queue says it left. Claiming a closure the chain has not confirmed would strand
 * a still-resting order in a terminal state that nothing revisits.
 */
export const applyLimitOrderCancel = ({
  records,
  payload,
  txHash,
}: ApplyLimitOrderCancelInput): LimitSwapTransactionRecord | null => {
  const parsed = attempt(() => parseCancelLimitSwapMemo(payload.memo ?? ''))
  if ('error' in parsed) {
    return null
  }

  const { address } = getKeysignCoin(payload)

  // Sorted before the bucket check, then `find`: oldest-first is what THORChain
  // will pick, so the first match is the answer and the remaining candidates
  // never need their eligibility resolved.
  const target = records
    .filter(
      (record): record is LimitSwapTransactionRecord =>
        record.type === 'limitSwap'
    )
    .filter(record => record.data.fromAddress === address)
    .filter(record => !record.data.cancelTxHash)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    .find(record => {
      const eligibility = getLimitSwapCancelEligibility(
        toLimitSwapCancelCandidate(record.data)
      )
      return (
        'cancellable' in eligibility &&
        areLimitOrdersCancelIndistinguishable(
          eligibility.cancellable,
          parsed.data
        )
      )
    })

  if (!target) {
    return null
  }

  return { ...target, data: { ...target.data, cancelTxHash: txHash } }
}
