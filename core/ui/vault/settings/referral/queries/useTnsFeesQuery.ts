import { useQuery } from '@tanstack/react-query'

import { getTnsFees } from '../serivces/getTnsFees'

export const useTnsFeesQuery = (years: number) => {
  return useQuery({
    queryKey: ['tns-fees', years],
    queryFn: () => getTnsFees(years),
  })
}
