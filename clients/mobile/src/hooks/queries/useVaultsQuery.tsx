export const vaultsQueryKey = ['vaults']
import { useQuery } from '@tanstack/react-query'

import { shouldBePresent } from '@/lib/utils/assert/shouldBePresent'
import { sortEntitiesWithOrder } from '@/lib/utils/entities/EntityWithOrder'

import { GetVaults } from '../../../../desktop/wailsjs/go/storage/Store'

export const vaultsQueryFn = async () => {
  const result = await GetVaults()

  if (result === null) {
    return []
  }

  return sortEntitiesWithOrder(result)
}

export const useVaultsQuery = () => {
  return useQuery({
    queryKey: vaultsQueryKey,
    queryFn: vaultsQueryFn,
  })
}

export const useVaults = () => {
  const { data } = useVaultsQuery()
  if (!data || data.length === 0) {
    return []
  }
  return shouldBePresent(data)
}
