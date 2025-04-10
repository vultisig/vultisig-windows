import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { sortEntitiesWithOrder } from '@lib/utils/entities/EntityWithOrder'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { GetVaultFolders } from '../../../../wailsjs/go/storage/Store'

export const vaultFoldersQueryKey = ['vaultFolders']

const vaultFoldersQueryFn = async () => {
  const result = await GetVaultFolders()

  return sortEntitiesWithOrder(result ?? [])
}

export const useVaultFoldersQuery = () => {
  return useQuery({
    queryKey: vaultFoldersQueryKey,
    queryFn: vaultFoldersQueryFn,
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
