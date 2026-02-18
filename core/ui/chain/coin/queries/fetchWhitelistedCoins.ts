import { Chain, EvmChain } from '@core/chain/Chain'
import { getEvmChainId } from '@core/chain/chains/evm/chainInfo'
import { Coin } from '@core/chain/coin/Coin'
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

export const fetchOneInchTokensRaw = async (
  chain: EvmChain
): Promise<OneInchTokensResponse> => {
  const evmChainId = getEvmChainId(chain)
  if (!evmChainId) {
    return { tokens: {} }
  }

  const parsedChainId = hexToNumber(evmChainId)
  const url = `${rootApiUrl}/1inch/swap/v6.0/${parsedChainId}/tokens`
  return queryUrl<OneInchTokensResponse>(url)
}

export const fetchOneInchCoins = async (chain: Chain): Promise<Coin[]> => {
  const data = await fetchOneInchTokensRaw(chain as EvmChain)
  const oneInchTokens = Object.values(data.tokens)

  return fromOneInchTokens({
    tokens: oneInchTokens,
    chain,
  })
}

export const fetchJupiterVerifiedTokens = async (
  chain: Chain
): Promise<Coin[]> => {
  const url = `${baseJupiterTokensUrl}/tag?query=verified`
  const data = await queryUrl<SolanaJupiterToken[]>(url)

  return fromSolanaJupiterTokens({
    tokens: data,
    chain,
  })
}

export const fetchWhitelistedCoins = async (chain: Chain): Promise<Coin[]> => {
  if (chain === Chain.Solana) {
    return fetchJupiterVerifiedTokens(chain)
  }

  const evmChainId = getEvmChainId(chain as EvmChain)
  if (evmChainId) {
    return fetchOneInchCoins(chain)
  }

  return []
}
