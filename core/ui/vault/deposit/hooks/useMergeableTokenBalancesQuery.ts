import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { fetchMergeableTokenBalances } from '@core/chain/chains/thorchain/ruji/services/fetchMergeableTokenBalances'
import { useQuery } from '@tanstack/react-query'

const staleTime = 30_000

export const useMergeableTokenBalancesQuery = (address: string) =>
  useQuery({
    queryKey: ['mergeableTokenBalances', address],
    staleTime,
    queryFn: () => fetchMergeableTokenBalances(address),
    enabled: !!address,
    select: data =>
      data.map(item => ({
        ...item,
        balances: data.map(({ shares }) => shares),
        balancesInDecimal: data.map(({ shares }) => fromChainAmount(shares, 8)),
      })),
  })
