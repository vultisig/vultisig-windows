import { useAssertCurrentVaultId } from '@core/ui/storage/currentVaultId'
import { useTransformQueryData } from '@lib/ui/query/hooks/useTransformQueryData'
import { useQuery } from '@tanstack/react-query'
import { useCallback } from 'react'

import { getVaultsTransactions, transactionsQueryKey } from './transactions'

const useTransactionsQuery = () => {
  return useQuery({
    queryKey: transactionsQueryKey,
    queryFn: getVaultsTransactions,
  })
}
export const useCurrentVaultTransactionsQuery = () => {
  const vaultId = useAssertCurrentVaultId()

  return useTransformQueryData(
    useTransactionsQuery(),
    useCallback(
      allTxs => {
        return allTxs?.[vaultId] ?? []
      },
      [vaultId]
    )
  )
}
