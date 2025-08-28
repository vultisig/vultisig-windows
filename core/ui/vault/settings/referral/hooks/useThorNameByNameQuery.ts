import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useQuery } from '@tanstack/react-query'

import { getUserThorchainNameDetails } from '../services/getUserThorchainNameDetails'

export const useThorNameByNameQuery = (name: string) =>
  useQuery({
    queryKey: ['thorname-by-name', name?.toLowerCase()],
    enabled: !!name,
    retry: false,
    ...noRefetchQueryOptions,
    queryFn: async () => {
      try {
        const details = await getUserThorchainNameDetails(name)
        return details
      } catch (error) {
        console.error(error)
        return undefined
      }
    },
  })
