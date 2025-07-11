import { useQuery } from '@tanstack/react-query'

import { getCurrentHeight } from '../services/getCurrentHeight'

export const useCurrentHeightQuery = () => {
  return useQuery({
    queryKey: ['current-height'],
    queryFn: getCurrentHeight,
  })
}
