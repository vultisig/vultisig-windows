import { useQuery } from '@tanstack/react-query'
import { Chain } from '@vultisig/core-chain/Chain'
import { getBlockchairBaseUrl } from '@vultisig/core-chain/chains/utxo/client/getBlockchairBaseUrl'
import { queryUrl } from '@vultisig/lib-utils/query/queryUrl'

type BlockchairStatsResponse = {
  data: {
    blocks: number
  }
}

/** Returns the current Bitcoin chain-tip block height. Refreshes every minute
 * since blocks arrive ~every 10 minutes on average. */
export const useBitcoinChainTipHeightQuery = () => {
  return useQuery({
    queryKey: ['bitcoinChainTipHeight'],
    queryFn: async () => {
      const url = `${getBlockchairBaseUrl(Chain.Bitcoin)}/stats`
      const response = await queryUrl<BlockchairStatsResponse>(url)
      return response.data.blocks
    },
    staleTime: 60_000,
  })
}
