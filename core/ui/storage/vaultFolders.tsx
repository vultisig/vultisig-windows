import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { sortEntitiesWithOrder } from '@lib/utils/entities/EntityWithOrder'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { vaultFoldersQueryKey } from '../query/keys'
import { useCoreStorage } from '../state/storage'

export const useVaultFoldersQuery = () => {
  const { getVaultFolders } = useCoreStorage()

  return useQuery({
    queryKey: vaultFoldersQueryKey,
    queryFn: async () => {
      const result = await getVaultFolders()

      return sortEntitiesWithOrder(result)
    },
  })
}

export const useVaultFolders = () => {
  const { data } = useVaultFoldersQuery()

  return shouldBePresent(data)
}

export const useVaultFolder = (id: string) => {
  const folders = useVaultFolders()

  return useMemo(() => folders.find(folder => folder.id === id), [folders, id])
}
