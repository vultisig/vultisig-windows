import { useInvalidateQueries } from '@lib/ui/query/hooks/useInvalidateQueries'
import { useMutation, UseMutationOptions } from '@tanstack/react-query'

import { ITransaction } from '../../utils/interfaces'
import {
  setVaultsTransactions,
  transactionsQueryKey,
} from '../state/transactions'
import {
  currentVaultTransactionsQueryKey,
  useTransactionsQuery,
} from '../state/useTransactions'

type AddOrUpdateInput = {
  vaultId: string
  transaction: ITransaction
}

export const useUpdateTransactionMutation = (
  options?: UseMutationOptions<any, any, AddOrUpdateInput, unknown>
) => {
  const invalidate = useInvalidateQueries()
  const { data: allTxs, isLoading } = useTransactionsQuery()

  return useMutation({
    mutationFn: async ({ vaultId, transaction }) => {
      if (!allTxs || isLoading) {
        throw new Error('Transactions are not loaded yet.')
      }

      const vaultTxs = allTxs[vaultId]
      if (!vaultTxs) {
        throw new Error(`No transactions found for vaultId: ${vaultId}`)
      }
      const exists = vaultTxs.some(tx => tx.id === transaction.id)

      if (!exists) {
        throw new Error(
          `Transaction with id ${transaction.id} does not exist in vault ${vaultId}`
        )
      }

      const updated = vaultTxs.map(tx =>
        tx.id === transaction.id ? transaction : tx
      )

      const updatedAll = {
        ...allTxs,
        [vaultId]: updated,
      }

      await setVaultsTransactions(updatedAll)
      return updated
    },
    onSuccess: async () => {
      await invalidate(transactionsQueryKey, currentVaultTransactionsQueryKey)
    },
    ...options,
  })
}
