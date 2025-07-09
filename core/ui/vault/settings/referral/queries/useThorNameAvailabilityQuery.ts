import { useQuery } from '@tanstack/react-query'

import { checkAvailability } from '../serivces/getThorname'

export const useThorNameAvailability = (name: string) =>
  useQuery({
    queryKey: ['tns-availability', name],
    queryFn: () => checkAvailability(name),
    enabled: !!name,
    staleTime: 60_000,
  })
