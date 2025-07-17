import { cosmosRpcUrl } from '@core/chain/chains/cosmos/cosmosRpcUrl'
import { queryUrl } from '@lib/utils/query/queryUrl'
import { useQuery } from '@tanstack/react-query'

const tcyStakerApiUrl = `${cosmosRpcUrl.THORChain}/thorchain/tcy_staker`

export const useUnstakableTcyQuery = (address: string) =>
  useQuery({
    queryKey: ['unstakable-tcy', address],
    queryFn: async () => {
      const { amount } = await queryUrl<{ amount?: string | null }>(
        `${tcyStakerApiUrl}/${address}`
      )
      return BigInt(amount ?? '0')
    },
  })
