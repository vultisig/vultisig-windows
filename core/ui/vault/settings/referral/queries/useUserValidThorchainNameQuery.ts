import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useQuery } from '@tanstack/react-query'

import { fetchUserValidName } from '../services/getUserValidThorchainName'

const getUserValidThorchainNameQueryKey = (address: string) => [
  'user-valid-thorchain-name',
  address,
]

export const useUserValidThorchainNameQuery = (address: string) =>
  useQuery({
    queryKey: getUserValidThorchainNameQueryKey(address),
    queryFn: () => fetchUserValidName(address),
    retry: false,
    staleTime: Infinity,
    ...noRefetchQueryOptions,
  })
