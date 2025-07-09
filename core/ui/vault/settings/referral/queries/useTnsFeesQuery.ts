import { useQuery } from '@tanstack/react-query'

import { getTnsFees } from '../serivces/getFees'

export const useTnsFees = (years: number) =>
  useQuery({
    queryKey: ['tns-fees'],
    queryFn: () => getTnsFees(years),
    enabled: !!years,
  })
