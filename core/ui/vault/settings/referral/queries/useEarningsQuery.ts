import { useQuery } from '@tanstack/react-query'

import { getEarnings } from '../services/getEarnings'

export const useEarningsQuery = (address: string) => {
  return useQuery({
    queryKey: ['earnings', address],
    queryFn: () => getEarnings(address),
  })
}
