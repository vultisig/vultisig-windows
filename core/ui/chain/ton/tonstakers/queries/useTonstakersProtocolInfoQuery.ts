import { useQuery } from '@tanstack/react-query'

import { getTonstakersProtocolInfo } from '../service'

export const getTonstakersProtocolInfoQueryKey = () =>
  ['tonstakersProtocolInfo'] as const

/** Validates the live Tonstakers pool, receipt master, minimum, rate, and APY. */
export const useTonstakersProtocolInfoQuery = (enabled = true) =>
  useQuery({
    queryKey: getTonstakersProtocolInfoQueryKey(),
    queryFn: getTonstakersProtocolInfo,
    enabled,
    staleTime: 30_000,
  })
