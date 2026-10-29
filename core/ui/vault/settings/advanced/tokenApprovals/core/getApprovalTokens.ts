import { EvmChain } from '@vultisig/core-chain/Chain'
import { getEvmNumericChainId } from '@vultisig/core-chain/chains/evm/chainInfo'
import { getEvmClient } from '@vultisig/core-chain/chains/evm/client'
import { Coin, Token } from '@vultisig/core-chain/coin/Coin'
import { toBatches } from '@vultisig/lib-utils/array/toBatches'
import { attempt } from '@vultisig/lib-utils/attempt'
import { erc20Abi, getAddress } from 'viem'

import { concurrentRequests, mapInBatches } from './mapInBatches'
import { queryOneInchApi } from './queryOneInchApi'

type OneInchCustomToken = {
  address: string
  symbol: string
  decimals: number
  logoURI?: string
}

type ReadErc20MetadataInput = {
  chain: EvmChain
  id: string
}

// Read straight from the contract rather than through getTokenMetadata, whose
// logo lookup has no timeout and retries 429s without limit.
const readErc20Metadata = async ({ chain, id }: ReadErc20MetadataInput) => {
  const client = getEvmClient(chain)
  const address = getAddress(id)
  const [ticker, decimals] = await Promise.all([
    client.readContract({ address, abi: erc20Abi, functionName: 'symbol' }),
    client.readContract({ address, abi: erc20Abi, functionName: 'decimals' }),
  ])
  return { ticker, decimals }
}

type GetApprovalTokensInput = {
  chain: EvmChain
  tokens: string[]
}

// The 1inch custom token endpoint accepts up to 50 addresses per request.
const tokensPerRequest = 50

/**
 * Resolves ticker, decimals and logo for the given token contracts, keyed by
 * lowercased address. 1inch's token list answers most of them in batches;
 * the rest are read on-chain, and tokens that are not readable ERC-20s are
 * left out.
 */
export const getApprovalTokens = async ({
  chain,
  tokens,
}: GetApprovalTokensInput): Promise<Record<string, Token<Coin<EvmChain>>>> => {
  const chainId = getEvmNumericChainId(chain)

  const oneInchTokens = (
    await mapInBatches({
      items: toBatches(tokens, tokensPerRequest),
      batchSize: concurrentRequests,
      map: batch =>
        queryOneInchApi<Record<string, OneInchCustomToken>>({
          path: `/token/v1.2/${chainId}/custom?addresses=${batch.join(',')}`,
        }),
    })
  ).flatMap(response => Object.values(response))

  const result: Record<string, Token<Coin<EvmChain>>> = Object.fromEntries(
    oneInchTokens.map(({ address, symbol, decimals, logoURI }) => [
      address.toLowerCase(),
      { chain, id: address, ticker: symbol, decimals, logo: logoURI },
    ])
  )

  const unknownTokens = tokens.filter(token => !(token in result))
  const onChainTokens = await mapInBatches({
    items: unknownTokens,
    batchSize: concurrentRequests,
    map: async id => {
      const result = await attempt(() => readErc20Metadata({ chain, id }))
      if ('error' in result) {
        return []
      }

      const { ticker, decimals } = result.data
      return [{ chain, id, ticker, decimals }]
    },
  })
  onChainTokens.flat().forEach(token => {
    result[token.id] = token
  })

  return result
}
