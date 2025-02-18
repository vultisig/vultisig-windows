export const vaultsQueryKey = ['vaults']
import { useQuery } from '@tanstack/react-query'

import { GetVaults } from '../../../../desktop/wailsjs/go/storage/Store'
import { sortEntitiesWithOrder } from '../../utils/array/sortEntitiesWithOrder'
import { shouldBePresent } from '../../utils/shouldBePresents'

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
