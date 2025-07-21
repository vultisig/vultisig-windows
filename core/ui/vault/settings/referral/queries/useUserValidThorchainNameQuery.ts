import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useQuery } from '@tanstack/react-query'

import { fetchUserValidName } from '../services/getUserValidThorchainName'

export const useUserValidThorchainNameQuery = (address: string) =>
  useQuery({
    queryKey: ['user-valid-thorchain-name'],
    queryFn: () => fetchUserValidName(address),
    retry: false,
    staleTime: Infinity,
    ...noRefetchQueryOptions,
  })
