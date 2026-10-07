import { useUpdateTransactionRecordMutation } from '@core/ui/storage/transactionHistory'
import { useCurrentVaultAddresses } from '@core/ui/vault/state/currentVaultCoins'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useQuery } from '@tanstack/react-query'
import { getTxStatus } from '@vultisig/core-chain/tx/status'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { useRef } from 'react'

import { TransactionRecord } from '../core'
import { getRecordLastValidBlockHeight } from './getRecordLastValidBlockHeight'
import { getRecordSenderAddress } from './getRecordSenderAddress'
import {
  getNetworkFeeBackfillRecord,
  getRecordFeeChain,
  withReceiptNetworkFee,
} from './networkFee'

/**
 * Reads the fee a settled send or swap paid when its record has none yet, and
 * stores it. The status poll stores the fee with its verdict, so this only
 * covers records that settled before fees were stored: the first open of one
 * asks the chain, and later opens read the stored fee. An open that got no
 * receipt, or could not store the fee, leaves the next open to ask again.
 */
export const useNetworkFeeBackfill = (record: TransactionRecord) => {
  const { mutateAsync: updateRecord } = useUpdateTransactionRecordMutation()
  const vaultAddresses = useCurrentVaultAddresses()
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
        senderAccountId: getRecordSenderAddress({
          record: target,
          vaultAddresses,
        }),
      })

      // Written onto the record as it is now, not the one the lookup started
      // from: anything the app stored meanwhile is newer than that snapshot.
      // The hook may be showing another record by then, and a receipt only
      // belongs to the transaction it was read for.
      const current = getNetworkFeeBackfillRecord(recordRef.current)
      const update =
        current?.id === target.id && current.txHash === target.txHash
          ? withReceiptNetworkFee({ record: current, receipt })
          : null
      if (update) {
        await updateRecord(update)
      }

      return receipt ?? null
    },
    enabled: backfillRecord !== null,
    ...noRefetchQueryOptions,
    refetchOnMount: true,
  })
}
