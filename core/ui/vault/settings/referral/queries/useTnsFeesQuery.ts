import { useQuery } from '@tanstack/react-query'

import { getTnsFees } from '../services/getTnsFees'

export const useTnsFeesQuery = (years: number) => {
  return useQuery({
    queryKey: ['tns-fees', years],
    queryFn: () => getTnsFees(years),
  })
}
