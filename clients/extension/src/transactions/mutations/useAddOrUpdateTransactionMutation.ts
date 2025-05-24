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

export const useAddOrUpdateTransactionMutation = (
  options?: UseMutationOptions<any, any, AddOrUpdateInput, unknown>
) => {
  const invalidate = useInvalidateQueries()
  const { data: allTxs } = useTransactionsQuery()

  return useMutation({
    mutationFn: async ({ vaultId, transaction }) => {
      const vaultTxs = allTxs[vaultId] ?? []
      const updated = vaultTxs.some(tx => tx.id === transaction.id)
        ? vaultTxs.map(tx => (tx.id === transaction.id ? transaction : tx))
        : [...vaultTxs, transaction]

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
