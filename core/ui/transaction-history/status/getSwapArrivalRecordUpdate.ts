import { getSwapArrivalStatus } from '@vultisig/core-chain/swap/utils/getSwapArrivalStatus'
import { getTxStatus } from '@vultisig/core-chain/tx/status'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'
import { attempt } from '@vultisig/lib-utils/attempt'
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
import { withReceiptNetworkFee } from './networkFee'

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

type GetSwapArrivalRecordUpdateInput = ArrivalTrackedSwap & {
  senderAccountId: string | undefined
}

/**
 * Settles a native swap from both reads. The source transaction goes first: it
 * is the deposit that starts the swap, and until it confirms — or if it
 * reverts — the provider has nothing to say. Once it confirms the record stays
 * pending, not confirmed, until the provider reports a payout or a refund; a
 * refund is stored as a failure with its reason, since the user got their
 * funds back rather than what they asked for.
 *
 * The deposit's fee is stored as soon as its receipt is read, without waiting
 * for the provider: it is final from then on, whatever the swap's outcome. A
 * provider that cannot be reached has said nothing yet, so the swap stays
 * pending and the fee is stored all the same.
 */
export const getSwapArrivalRecordUpdate = async ({
  record: storedRecord,
  provider,
  senderAccountId,
}: GetSwapArrivalRecordUpdateInput): Promise<SwapArrivalRecordUpdate> => {
  const source = await getTxStatus({
    chain: storedRecord.data.fromChain,
    hash: storedRecord.txHash,
    lastValidBlockHeight: getRecordLastValidBlockHeight(storedRecord),
    senderAccountId,
  })

  if (getSwapSourceOutcome(source) !== 'success') {
    const update = getTxStatusRecordUpdate({
      record: storedRecord,
      result: source,
    })

    return {
      status: match(getSwapSourceOutcome(source), {
        pending: () => 'pending',
        success: () => 'success',
        failed: () => 'error',
      }),
      record: update ?? undefined,
    }
  }

  const withFee = withReceiptNetworkFee({
    record: storedRecord,
    receipt: source.receipt,
  })
  const record = withFee ?? storedRecord

  const arrivalResult = await attempt(
    getSwapArrivalStatus({
      provider,
      txHash: record.txHash,
    })
  )

  if ('error' in arrivalResult) {
    return { status: 'pending', record: withFee ?? undefined }
  }

  const arrival = arrivalResult.data

  return match<SwapOutcome, SwapArrivalRecordUpdate>(
    getSwapArrivalOutcome(arrival),
    {
      pending: () => ({ status: 'pending', record: withFee ?? undefined }),
      success: () => ({
        status: 'success',
        record:
          record.status === 'confirmed'
            ? (withFee ?? undefined)
            : { ...record, status: 'confirmed' },
      }),
      failed: () => ({
        status: 'error',
        record:
          record.status === 'failed'
            ? (withFee ?? undefined)
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
