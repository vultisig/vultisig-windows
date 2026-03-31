import { useQuery } from '@tanstack/react-query'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { Chain } from '@vultisig/core-chain/Chain'
import { fetchMergeableTokenBalances } from '@vultisig/core-chain/chains/thorchain/ruji/services/fetchMergeableTokenBalances'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { bigIntSum } from '@vultisig/lib-utils/bigint/bigIntSum'

import { useCurrentVaultAddresses } from '../../state/currentVaultCoins'

const staleTime = 30_000

export const useMergeableTokenBalancesQuery = () => {
  const address = useCurrentVaultAddresses()[Chain.THORChain]

  return useQuery({
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
}
