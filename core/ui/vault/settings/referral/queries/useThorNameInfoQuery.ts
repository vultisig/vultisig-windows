import { useQuery } from '@tanstack/react-query'

import { getNameInfo } from '../services/getThorname'

export const useThorNameInfoQuery = (name: string) =>
  useQuery({
    queryKey: ['tns-info', name],
    queryFn: () => getNameInfo(name),
    enabled: !!name,
  })
