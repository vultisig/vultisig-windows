import { cosmosRpcUrl } from '@core/chain/chains/cosmos/cosmosRpcUrl'
import { useQuery } from '@tanstack/react-query'

const TYC_STAKER_API_URL = `${cosmosRpcUrl.THORChain}/thorchain/tcy_staker`

export const useUnstakableTcyQuery = (address: string) =>
  useQuery({
    queryKey: ['unstakable-tcy', address],
    queryFn: async () => {
      const res = await fetch(`${TYC_STAKER_API_URL}/${address}`)
      const json = (await res.json()) as { amount?: string | null }
      return BigInt(json.amount ?? '0')
    },
  })
