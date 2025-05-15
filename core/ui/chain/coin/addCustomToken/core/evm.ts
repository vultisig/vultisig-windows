import { EvmChain } from '@core/chain/Chain'
import { getEvmClient } from '@core/chain/chains/evm/client'
import { Address, erc20Abi } from 'viem'

import { CustomTokenResolver } from './CustomTokenResolver'

export const getEvmCustomToken: CustomTokenResolver<EvmChain> = async ({
  chain,
  address,
}) => {
  const publicClient = getEvmClient(chain)

  const [ticker, decimals] = await Promise.all([
    publicClient.readContract({
      address: address as Address,
      abi: erc20Abi,
      functionName: 'symbol',
    }),
    publicClient.readContract({
      address: address as Address,
      abi: erc20Abi,
      functionName: 'decimals',
    }),
  ])

  return {
    chain,
    id: address,
    ticker,
    decimals,
  }
}
