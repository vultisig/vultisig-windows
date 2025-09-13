import { Chain, EvmChain } from '@core/chain/Chain'
import { getEvmChainId } from '@core/chain/chains/evm/chainInfo'
import {
  fromSolanaJupiterTokens,
  SolanaJupiterToken,
} from '@core/chain/coin/jupiter/token'
import {
  fromOneInchTokens,
  OneInchTokensResponse,
} from '@core/chain/coin/oneInch/token'
import { baseJupiterTokensUrl } from '@core/chain/coin/token/metadata/resolvers/solana'
import { rootApiUrl } from '@core/config'
import { hexToNumber } from '@lib/utils/hex/hexToNumber'
import { queryUrl } from '@lib/utils/query/queryUrl'
import { useQuery } from '@tanstack/react-query'

export const useWhitelistedCoinsQuery = (chain: Chain, enabled?: boolean) => {
  return useQuery({
    queryKey: ['whitelistedCoins', chain],
    enabled,
    queryFn: async () => {
      if (chain === Chain.Solana) {
        const url = `${baseJupiterTokensUrl}/tag?query=verified`
        const data = await queryUrl<SolanaJupiterToken[]>(url)

        return fromSolanaJupiterTokens({
          tokens: data,
          chain,
        })
      } else {
        const evmChainId = getEvmChainId(chain as EvmChain)

        if (evmChainId) {
          const parsedChainId = hexToNumber(evmChainId)
          const url = `${rootApiUrl}/1inch/swap/v6.0/${parsedChainId}/tokens`
          const data = await queryUrl<OneInchTokensResponse>(url)

          const oneInchTokens = Object.values(data.tokens)

          return fromOneInchTokens({
            tokens: oneInchTokens,
            chain,
          })
        }
      }

      return []
    },
  })
}
