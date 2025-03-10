import { Chain, EvmChain } from '@core/chain/Chain'
import { getEvmChainId } from '@core/chain/chains/evm/chainInfo'
import {
  fromSolanaJupiterTokens,
  SolanaJupiterToken,
} from '@core/chain/coin/jupiter/token'
import { rootApiUrl } from '@core/config'
import { queryUrl } from '@lib/utils/query/queryUrl'
import { useQuery } from '@tanstack/react-query'

import { fromOneInchTokens, OneInchTokensResponse } from '../oneInch/token'

export const useWhitelistedCoinsQuery = (chain: Chain) => {
  return useQuery({
    queryKey: ['whitelistedCoins', chain],
    queryFn: async () => {
      if (chain === Chain.Solana) {
        const url = 'https://tokens.jup.ag/tokens?tags=verified'
        const data = await queryUrl<SolanaJupiterToken[]>(url) // Jupiter API returns an array

        return fromSolanaJupiterTokens({
          tokens: data,
          chain,
        })
      } else {
        const evmChainId = getEvmChainId(chain as EvmChain)
        if (evmChainId) {
          const url = `${rootApiUrl}/1inch/swap/v6.0/${evmChainId}/tokens`
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
