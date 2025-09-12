import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { fetchMergeableTokenBalances } from '@core/chain/chains/thorchain/ruji/services/fetchMergeableTokenBalances'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { bigIntSum } from '@lib/utils/bigint/bigIntSum'
import { useQuery } from '@tanstack/react-query'

const staleTime = 30_000

export const useMergeableTokenBalancesQuery = (address: string) =>
  useQuery({
    queryKey: ['mergeableTokenBalances', address],
    staleTime,
    queryFn: () => fetchMergeableTokenBalances(address),
    enabled: !!address,
    select: items => {
      const decimals = chainFeeCoin['THORChain'].decimals

      const totalSharesBI = bigIntSum(
        items.map(i => BigInt(i.sharesChain || '0'))
      )

      const totalShares = fromChainAmount(totalSharesBI.toString(), decimals)

      return {
        balances: items.map(i => ({
          ...i,
          shares: fromChainAmount(i.sharesChain, decimals),
        })),
        totalShares,
        totalSharesFormatted: totalShares.toFixed(8),
      }
    },
  })
