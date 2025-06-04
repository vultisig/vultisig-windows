import { cosmosRpcUrl } from '@core/chain/chains/cosmos/cosmosRpcUrl'
import { useQuery } from '@tanstack/react-query'

const tcyStakerApiUrl = `${cosmosRpcUrl.THORChain}/thorchain/tcy_staker`

export const useUnstakableTcyQuery = (address: string) =>
  useQuery({
    queryKey: ['unstakable-tcy', address],
    queryFn: async () => {
      const res = await fetch(`${tcyStakerApiUrl}/${address}`)
      const json = (await res.json()) as { amount?: string | null }
      return BigInt(json.amount ?? '0')
    },
  })
