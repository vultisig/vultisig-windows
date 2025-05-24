import { useAssertCurrentVaultId } from '@core/ui/storage/currentVaultId'
import { useQuery } from '@tanstack/react-query'

import {
  getVaultsTransactions,
  getVaultTransactions,
  transactionsQueryKey,
} from './transactions'

export const currentVaultTransactionsQueryKey = ['currentVaultTransactions']

export const useTransactionsQuery = () => {
  return useQuery({
    queryKey: transactionsQueryKey,
    queryFn: getVaultsTransactions,
    initialData: {},
  })
}

export const useCurrentVaultTransactionsQuery = () => {
  const vaultId = useAssertCurrentVaultId()

  return useQuery({
    queryKey: currentVaultTransactionsQueryKey,
    queryFn: async () => getVaultTransactions(vaultId),
  })
}
