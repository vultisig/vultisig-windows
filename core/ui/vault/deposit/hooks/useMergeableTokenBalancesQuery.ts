import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { fetchMergeableTokenBalances } from '@core/chain/chains/thorchain/ruji/services/fetchMergeableTokenBalances'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { useQuery } from '@tanstack/react-query'

const staleTime = 30_000

export const useMergeableTokenBalancesQuery = (address: string) =>
  useQuery({
    queryKey: ['mergeableTokenBalances', address],
    staleTime,
    queryFn: () => fetchMergeableTokenBalances(address),
    enabled: !!address,
    select: items => {
      const totalSharesChain = items.reduce<bigint>(
        (acc, i) => acc + BigInt(i.sharesChain),
        0n
      )

      const decimals = chainFeeCoin['THORChain'].decimals

      return {
        balances: items.map(i => ({
          ...i,
          shares: fromChainAmount(i.sharesChain, decimals),
        })),
        totalSharesChain,
        totalShares: fromChainAmount(totalSharesChain.toString(), decimals),
      }
    },
  })
