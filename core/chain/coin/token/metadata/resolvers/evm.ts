import { EvmChain } from '@core/chain/Chain'
import { getEvmClient } from '@core/chain/chains/evm/client'
import { TokenMetadataResolver } from '@core/chain/coin/token/metadata/resolver'
import { Address, erc20Abi } from 'viem'

export const getEvmTokenMetadata: TokenMetadataResolver<EvmChain> = async ({
  chain,
  id,
}) => {
  const publicClient = getEvmClient(chain)

  const [ticker, decimals] = await Promise.all([
    publicClient.readContract({
      address: id as Address,
      abi: erc20Abi,
      functionName: 'symbol',
    }),
    publicClient.readContract({
      address: id as Address,
      abi: erc20Abi,
      functionName: 'decimals',
    }),
  ])

  return {
    ticker,
    decimals,
  }
}
