import { useQuery } from '@tanstack/react-query'

import { getActivePools } from '../services/getActivePools'

export const useActivePoolsQuery = () => {
  return useQuery({
    queryKey: ['active-pools'],
    queryFn: getActivePools,
  })
}
