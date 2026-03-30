import { useQuery, UseQueryOptions } from '@tanstack/react-query'
import { cosmosRpcUrl } from '@vultisig/core-chain/chains/cosmos/cosmosRpcUrl'
import { queryUrl } from '@vultisig/lib-utils/query/queryUrl'

const tcyStakerApiUrl = `${cosmosRpcUrl.THORChain}/thorchain/tcy_staker`

export const useUnstakableTcyQuery = ({
  address,
  options,
}: {
  address: string
  options?: Partial<UseQueryOptions<bigint>>
}) =>
  useQuery({
    queryKey: ['unstakable-tcy', address],
    queryFn: async () => {
      const { amount } = await queryUrl<{ amount?: string | null }>(
        `${tcyStakerApiUrl}/${address}`
      )
      return BigInt(amount ?? '0')
    },
    ...options,
  })
