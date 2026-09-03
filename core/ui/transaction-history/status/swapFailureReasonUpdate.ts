import { EvmChain } from '@vultisig/core-chain/Chain'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'

import { SwapTransactionRecord, TransactionRecord } from '../core'
import { getEvmTxRevert } from './getEvmTxRevert'
import { getSwapFailureReason, SwapFailureReason } from './swapFailureReason'

const evmChains = Object.values(EvmChain)

/** A failed EVM swap the chain has not been asked about yet. */
export type UnaskedEvmSwapFailure = SwapTransactionRecord & { chain: EvmChain }

/**
 * Whether the chain still has to be asked why this swap failed.
 *
 * CowSwap orders are excluded outright: a resting order's `txHash` is its
 * off-chain order UID, which is hex and so passes for a transaction hash while
 * never naming one. Only a settled order carries a real hash, and a settled
 * order did not fail.
 */
export const isUnaskedEvmSwapFailure = (
  record: TransactionRecord
): record is UnaskedEvmSwapFailure =>
  record.type === 'swap' &&
  record.status === 'failed' &&
  record.data.failureReasonCheckedAt === undefined &&
  record.data.cowSwapOrderApiBase === undefined &&
  isOneOf(record.chain, evmChains)

/** The fields one lookup produces, to store on the record it asked about. */
export type SwapFailureReasonUpdate = {
  failureReason?: SwapFailureReason
  failureReasonCheckedAt: string
}

/**
 * Asks the chain why a swap failed, and returns what to store either way.
 *
 * The marker is written even when nothing was learned, which is what stops a
 * record being asked about on every history open for the rest of its life. No
 * outcome here improves with waiting: a node that would not replay the block
 * holds even less of it tomorrow, and a revert nobody recognises stays
 * unrecognised. The one case this gives up on is a lookup that failed to a
 * passing network fault, and a row keeping its plain wording is much the
 * cheaper mistake.
 */
export const readSwapFailureReason = async (
  record: UnaskedEvmSwapFailure
): Promise<SwapFailureReasonUpdate> => {
  const revert = await getEvmTxRevert({
    chain: record.chain,
    txHash: record.txHash,
  })

  return {
    failureReason: revert ? getSwapFailureReason(revert) : undefined,
    failureReasonCheckedAt: new Date().toISOString(),
  }
}

type WithSwapFailureReasonInput = {
  record: UnaskedEvmSwapFailure
  reason: SwapFailureReasonUpdate
}

/** The record to persist once the chain has answered. */
export const withSwapFailureReason = ({
  record,
  reason,
}: WithSwapFailureReasonInput): TransactionRecord => ({
  ...record,
  data: { ...record.data, ...reason },
})
