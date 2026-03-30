import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { Chain } from '@vultisig/core-chain/Chain'
import { getTonBalance } from '@vultisig/core-chain/chains/ton/account/getTonBalance'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'

export const useTonUnstakableQuery = ({
  address,
  options,
}: {
  address?: string | null
  options?: Partial<UseQueryOptions<bigint>>
}) =>
  useQuery({
    queryKey: ['ton-unstakable', address],
    queryFn: async () => {
      if (!address) return 0n

      const data = await getTonBalance(address)
      const pools = data.pools ?? []

      const totalPoolAmount = pools.reduce((sum, pool) => {
        return sum + BigInt(pool.amount || '0')
      }, 0n)

      return totalPoolAmount
    },
    ...options,
    select: (data = 0n) => ({
      chainBalance: data,
      humanReadableBalance: fromChainAmount(
        data,
        chainFeeCoin[Chain.Ton].decimals
      ),
    }),
  })
