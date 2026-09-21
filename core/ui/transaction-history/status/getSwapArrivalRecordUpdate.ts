import { getSwapArrivalStatus } from '@vultisig/core-chain/swap/utils/getSwapArrivalStatus'
import { getTxStatus } from '@vultisig/core-chain/tx/status'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { match } from '@vultisig/lib-utils/match'

import {
  TrackedSwapArrivalProvider,
  trackedSwapArrivalProviders,
} from '../../vault/swap/arrival/swapArrivalProvider'
import {
  getSwapArrivalOutcome,
  getSwapSourceOutcome,
  SwapOutcome,
} from '../../vault/swap/arrival/swapOutcome'
import { SwapTransactionRecord, TransactionRecord } from '../core'
import { getRecordLastValidBlockHeight } from './getRecordLastValidBlockHeight'
import { getTxStatusRecordUpdate } from './getTxStatusRecordUpdate'

/** A swap record whose provider is asked whether it paid out. */
export type ArrivalTrackedSwap = {
  record: SwapTransactionRecord
  provider: TrackedSwapArrivalProvider
}

/**
 * The provider to ask about this record's arrival, if it is a swap that
 * stored one this build knows how to ask. A provider written by a newer build
 * is a string with no status API behind it here, so it is treated as untracked
 * and the record falls back to its source transaction's verdict.
 */
export const getArrivalTrackedSwap = (
  record: TransactionRecord
): ArrivalTrackedSwap | undefined => {
  if (record.type !== 'swap') return undefined

  const { arrivalProvider } = record.data

  return isOneOf(arrivalProvider, trackedSwapArrivalProviders)
    ? { record, provider: arrivalProvider }
    : undefined
}

type SwapArrivalRecordUpdate = {
  /** Mapped to the poller's chain-status shape so the shared refetch-stop
   * logic (`success` / `error` halts polling) works unchanged. */
  status: 'pending' | 'success' | 'error'
  /** The record to persist, or `undefined` when nothing changed. */
  record?: TransactionRecord
}

/**
 * Settles a native swap from both reads. The source transaction goes first: it
 * is the deposit that starts the swap, and until it confirms — or if it
 * reverts — the provider has nothing to say. Once it confirms the record stays
 * pending, not confirmed, until the provider reports a payout or a refund; a
 * refund is stored as a failure with its reason, since the user got their
 * funds back rather than what they asked for.
 */
export const getSwapArrivalRecordUpdate = async ({
  record,
  provider,
}: ArrivalTrackedSwap): Promise<SwapArrivalRecordUpdate> => {
  const source = await getTxStatus({
    chain: record.data.fromChain,
    hash: record.txHash,
    lastValidBlockHeight: getRecordLastValidBlockHeight(record),
  })

  if (getSwapSourceOutcome(source) !== 'success') {
    const update = getTxStatusRecordUpdate({ record, result: source })

    return {
      status: match(getSwapSourceOutcome(source), {
        pending: () => 'pending',
        success: () => 'success',
        failed: () => 'error',
      }),
      record: update ?? undefined,
    }
  }

  const arrival = await getSwapArrivalStatus({
    provider,
    txHash: record.txHash,
  })

  return match<SwapOutcome, SwapArrivalRecordUpdate>(
    getSwapArrivalOutcome(arrival),
    {
      pending: () => ({ status: 'pending' }),
      success: () => ({
        status: 'success',
        record:
          record.status === 'confirmed'
            ? undefined
            : { ...record, status: 'confirmed' },
      }),
      failed: () => ({
        status: 'error',
        record:
          record.status === 'failed'
            ? undefined
            : {
                ...record,
                status: 'failed',
                data: {
                  ...record.data,
                  ...(arrival.status === 'refunded'
                    ? {
                        failureReason: 'refunded',
                        failureReasonCheckedAt: new Date().toISOString(),
                      }
                    : {}),
                },
              },
      }),
    }
  )
}
