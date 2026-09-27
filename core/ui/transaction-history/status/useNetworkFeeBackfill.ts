import { useUpdateTransactionRecordMutation } from '@core/ui/storage/transactionHistory'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useQuery } from '@tanstack/react-query'
import { getTxStatus } from '@vultisig/core-chain/tx/status'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { useRef } from 'react'

import { TransactionRecord } from '../core'
import { getRecordLastValidBlockHeight } from './getRecordLastValidBlockHeight'
import {
  getNetworkFeeBackfillRecord,
  getRecordFeeChain,
  withReceiptNetworkFee,
} from './networkFee'

/**
 * Reads the fee a settled send or swap paid when its record has none yet, and
 * stores it. The status poll stores the fee with its verdict, so this only
 * covers records that settled before fees were stored: the first open of one
 * asks the chain, and later opens read the stored fee.
 */
export const useNetworkFeeBackfill = (record: TransactionRecord) => {
  const { mutate: updateRecord } = useUpdateTransactionRecordMutation()
  const recordRef = useRef(record)
  recordRef.current = record
  const backfillRecord = getNetworkFeeBackfillRecord(record)

  useQuery({
    queryKey: ['transactionNetworkFeeBackfill', record.id, record.txHash],
    queryFn: async () => {
      const target = shouldBePresent(backfillRecord, 'record missing a fee')
      const { receipt } = await getTxStatus({
        chain: getRecordFeeChain(target),
        hash: target.txHash,
        lastValidBlockHeight: getRecordLastValidBlockHeight(target),
      })

      // Written onto the record as it is now, not the one the lookup started
      // from: anything the app stored meanwhile is newer than that snapshot.
      const current = getNetworkFeeBackfillRecord(recordRef.current)
      const update = current
        ? withReceiptNetworkFee({ record: current, receipt })
        : null
      if (update) {
        updateRecord(update)
      }

      return receipt ?? null
    },
    enabled: backfillRecord !== null,
    ...noRefetchQueryOptions,
    staleTime: Infinity,
  })
}
