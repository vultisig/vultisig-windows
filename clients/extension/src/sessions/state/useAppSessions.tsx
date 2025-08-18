import { getVaultsAppSessions } from '@core/extension/storage/appSessions'
import { useAssertCurrentVaultId } from '@core/ui/storage/currentVaultId'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { useTransformQueryData } from '@lib/ui/query/hooks/useTransformQueryData'
import { useQuery } from '@tanstack/react-query'

export const useAppSessionsQuery = () => {
  return useQuery({
    queryKey: [StorageKey.appSessions],
    queryFn: getVaultsAppSessions,
    initialData: {},
  })
}

export const useCurrentVaultAppSessionsQuery = () => {
  const vaultId = useAssertCurrentVaultId()

  return useTransformQueryData(
    useAppSessionsQuery(),
    data => data[vaultId] ?? {}
  )
}
