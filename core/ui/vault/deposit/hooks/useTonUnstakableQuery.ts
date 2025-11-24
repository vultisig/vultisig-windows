import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { getTonBalance } from '@core/chain/chains/ton/account/getTonBalance'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { useQuery, UseQueryOptions } from '@tanstack/react-query'

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
