import { fetchMergeableTokenBalances } from '@core/chain/chains/thorchain/ruji/services/fetchMergeableTokenBalances'
import { useQuery } from '@tanstack/react-query'

const staleTime = 30_000

export const useMergeableTokenBalancesQuery = (address: string) =>
  useQuery({
    queryKey: ['mergeableTokenBalances', address],
    staleTime,
    queryFn: () => fetchMergeableTokenBalances(address),
    enabled: !!address,
  }) 
