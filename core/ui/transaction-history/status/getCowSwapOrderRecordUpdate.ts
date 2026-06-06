import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { getCowSwapOrderStatus } from '@vultisig/core-chain/swap/general/cowswap/api/getCowSwapOrderStatus'
import { getBlockExplorerUrl } from '@vultisig/core-chain/utils/getBlockExplorerUrl'

import { SwapTransactionRecord, TransactionRecord } from '../core'

/** A pending CowSwap order: `txHash` is the orderbook UID, not a chain hash. */
export const getCowSwapOrderApiBase = (
  record: TransactionRecord
): { record: SwapTransactionRecord; apiBase: string } | null => {
  if (record.type !== 'swap') {
    return null
  }
  const { cowSwapOrderApiBase } = record.data
  return cowSwapOrderApiBase ? { record, apiBase: cowSwapOrderApiBase } : null
}

type GetCowSwapOrderRecordUpdateInput = {
  record: SwapTransactionRecord
  apiBase: string
}

type CowSwapOrderRecordUpdate = {
  /** Mapped to the poller's chain-status shape so the shared refetch-stop
   * logic (`success` / `error` halts polling) works unchanged. */
  status: 'pending' | 'success' | 'error'
  /** The record to persist, or `undefined` when nothing changed. */
  record?: SwapTransactionRecord
}

/**
 * Poll a CowSwap order by UID and map its off-chain lifecycle onto a
 * transaction record:
 *   - `filled`              → confirmed; swap `txHash`/explorer to the on-chain
 *                             settlement tx and surface the executed buy amount
 *   - `expired`/`cancelled` → failed
 *   - `open`                → still pending
 *
 * The record's `txHash` is the order UID until settlement; CowSwap orders have
 * no chain tx hash to poll until then, so this bypasses the generic chain
 * status poller entirely.
 */
export const getCowSwapOrderRecordUpdate = async ({
  record,
  apiBase,
}: GetCowSwapOrderRecordUpdateInput): Promise<CowSwapOrderRecordUpdate> => {
  const result = await getCowSwapOrderStatus({ apiBase, uid: record.txHash })

  if (result.status === 'filled') {
    const settlementHash = result.txHash ?? record.txHash
    const toAmount = result.executedBuyAmount
      ? fromChainAmount(
          result.executedBuyAmount,
          record.data.toDecimals
        ).toFixed(record.data.toDecimals)
      : record.data.toAmount

    return {
      status: 'success',
      record: {
        ...record,
        status: 'confirmed',
        txHash: settlementHash,
        explorerUrl: getBlockExplorerUrl({
          chain: record.chain,
          entity: 'tx',
          value: settlementHash,
        }),
        data: { ...record.data, toAmount },
      },
    }
  }

  if (result.status === 'expired' || result.status === 'cancelled') {
    return {
      status: 'error',
      record: { ...record, status: 'failed' },
    }
  }

  return {
    status: 'pending',
    record:
      record.status === 'pending'
        ? undefined
        : { ...record, status: 'pending' },
  }
}
