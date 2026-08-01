import { useQuery } from '@tanstack/react-query'

import { getTonstakersPosition } from '../service'

export const getTonstakersPositionQueryKey = (address: string | undefined) =>
  ['tonstakersPosition', address] as const

/** Reads a vault's live tsTON balance, validated rate, APY, and jetton wallet. */
export const useTonstakersPositionQuery = (address: string | undefined) =>
  useQuery({
    queryKey: getTonstakersPositionQueryKey(address),
    queryFn: () => getTonstakersPosition(address ?? ''),
    enabled: !!address,
    staleTime: 30_000,
  })
