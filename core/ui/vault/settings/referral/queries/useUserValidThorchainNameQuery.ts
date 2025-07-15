import { useQuery } from '@tanstack/react-query'

import { fetchUserValidName } from '../services/getUserValidThorchainName'

export const useUserValidThorchainNameQuery = (address: string) =>
  useQuery({
    queryKey: ['user-valid-thorchain-name', address],
    queryFn: () => fetchUserValidName(address),
    retry: false,
  })
