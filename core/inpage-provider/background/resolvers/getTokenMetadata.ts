import { getBackgroundEvmClient } from '@core/inpage-provider/background/core/getBackgroundEvmClient'
import { BackgroundResolver } from '@core/inpage-provider/background/resolver'
import { isChainOfKind } from '@vultisig/core-chain/ChainKind'
import { getTokenMetadata as getChainTokenMetadata } from '@vultisig/core-chain/coin/token/metadata'
import { erc20Abi, isAddress } from 'viem'
import { readContract } from 'viem/actions'

/**
 * Resolves a token's symbol and decimals for dApp requests such as
 * `wallet_watchAsset`.
 *
 * EVM tokens are read here instead of through the SDK resolver: that one
 * builds viem's public client, which cannot be constructed once the background
 * has frozen `Function.prototype` (see `getBackgroundEvmClient`). Standalone
 * `readContract` only needs `client.request`, so it works under the freeze.
 * Other chain kinds delegate to the SDK.
 */
export const getTokenMetadata: BackgroundResolver<'getTokenMetadata'> = async ({
  input,
}) => {
  const { chain, id } = input

  if (!isChainOfKind(chain, 'evm')) {
    return getChainTokenMetadata(input)
  }

  if (!isAddress(id, { strict: false })) {
    throw new Error(`Invalid ERC-20 token address: ${id}`)
  }

  const client = getBackgroundEvmClient(chain)

  const [ticker, decimals] = await Promise.all([
    readContract(client, {
      address: id,
      abi: erc20Abi,
      functionName: 'symbol',
    }),
    readContract(client, {
      address: id,
      abi: erc20Abi,
      functionName: 'decimals',
    }),
  ])

  return { ticker, decimals }
}
