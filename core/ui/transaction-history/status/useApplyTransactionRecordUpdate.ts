import { getBalanceQueryKey } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { useUpdateTransactionRecordMutation } from '@core/ui/storage/transactionHistory'
import { useCurrentVaultAddresses } from '@core/ui/vault/state/currentVaultCoins'
import { useQueryClient } from '@tanstack/react-query'

import { TransactionRecord } from '../core'
import { getRecordAffectedCoinKeys } from './getRecordAffectedCoinKeys'

type ApplyTransactionRecordUpdateInput = {
  /** The record as stored before this poll. */
  previous: TransactionRecord
  /** The record the poll produced, to persist in its place. */
  update: TransactionRecord
}

/**
 * Persists a polled status update and, on the transition into `confirmed`,
 * refreshes the balances that transaction moved.
 *
 * Confirmation is the first moment a node reliably reports the new amounts —
 * the invalidation at broadcast time usually still reads pre-transaction
 * balances — so this is what makes a send or swap settle on screen without a
 * manual refresh. Guarding on the transition keeps it to once per transaction.
 */
export const useApplyTransactionRecordUpdate = () => {
  const { mutate: updateRecord } = useUpdateTransactionRecordMutation()
  const queryClient = useQueryClient()
  const vaultAddresses = useCurrentVaultAddresses()

  return ({ previous, update }: ApplyTransactionRecordUpdateInput) => {
    updateRecord(update)

    if (update.status !== 'confirmed' || previous.status === 'confirmed') return

    getRecordAffectedCoinKeys({ record: update, vaultAddresses }).forEach(
      coinKey => {
        void queryClient.invalidateQueries({
          queryKey: getBalanceQueryKey(coinKey),
        })
      }
    )
  }
}
