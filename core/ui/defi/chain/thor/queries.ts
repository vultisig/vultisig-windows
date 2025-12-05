import { fetchMergeableTokenBalances } from '@core/chain/chains/thorchain/ruji/services/fetchMergeableTokenBalances'
import { fetchRujiraStakeView } from '@core/chain/chains/thorchain/ruji/services/fetchStakeView'
import { UseQueryOptions } from '@tanstack/react-query'

import {
  fetchThorBondMetrics,
  fetchThorLpPositions,
  fetchThorTcyStakedAmount,
  ThorBondNodeMetrics,
  ThorchainLpPosition,
} from './api'
import { thorDefiStaleTimeMs } from './constants'

type Address = string | undefined

export const thorBondedNodesQuery = (
  address: Address
): UseQueryOptions<
  ThorBondNodeMetrics[],
  Error,
  ThorBondNodeMetrics[],
  readonly [string, Address | null]
> => ({
  queryKey: ['thor-bonds', address ?? null] as const,
  queryFn: () => fetchThorBondMetrics(address ?? ''),
  enabled: !!address,
  staleTime: thorDefiStaleTimeMs,
})

export const thorTcyStakeQuery = (
  address: Address
): UseQueryOptions<
  bigint,
  Error,
  bigint,
  readonly [string, Address | null]
> => ({
  queryKey: ['thor-stake-tcy', address ?? null] as const,
  queryFn: () => fetchThorTcyStakedAmount(address ?? ''),
  enabled: !!address,
  staleTime: thorDefiStaleTimeMs,
})

export const thorMergedAssetsQuery = (
  address: Address
): UseQueryOptions<
  Awaited<ReturnType<typeof fetchMergeableTokenBalances>>,
  Error,
  Awaited<ReturnType<typeof fetchMergeableTokenBalances>>,
  readonly [string, Address | null]
> => ({
  queryKey: ['thor-merged-assets', address ?? null] as const,
  queryFn: () =>
    address
      ? fetchMergeableTokenBalances(address)
      : Promise.resolve(
          [] as Awaited<ReturnType<typeof fetchMergeableTokenBalances>>
        ),
  enabled: !!address,
  staleTime: thorDefiStaleTimeMs,
})

export const rujiStakeViewQuery = (
  address: Address
): UseQueryOptions<
  Awaited<ReturnType<typeof fetchRujiraStakeView>> | null,
  Error,
  Awaited<ReturnType<typeof fetchRujiraStakeView>> | null,
  readonly [string, Address | null]
> => ({
  queryKey: ['ruji-stake-view', address ?? null] as const,
  queryFn: () =>
    address ? fetchRujiraStakeView(address) : Promise.resolve(null),
  enabled: !!address,
  staleTime: thorDefiStaleTimeMs,
})

export const thorLpPositionsQuery = (
  address: Address
): UseQueryOptions<
  ThorchainLpPosition[],
  Error,
  ThorchainLpPosition[],
  readonly [string, Address | null]
> => ({
  queryKey: ['thor-lp-positions', address ?? null] as const,
  queryFn: () => fetchThorLpPositions(address ?? ''),
  enabled: !!address,
  staleTime: thorDefiStaleTimeMs,
})
