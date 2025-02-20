import { EvmChain } from '@core/chain/Chain'
import { getEvmClient } from '@core/chain/chains/evm/client'
import { Address, erc20Abi } from 'viem'

type Input = {
  chain: EvmChain
  address: Address
  ownerAddress: Address
  spenderAddress: Address
}

export const getErc20Allowance = async ({
  chain,
  address,
  ownerAddress,
  spenderAddress,
}: Input) => {
  const publicClient = getEvmClient(chain)

  return publicClient.readContract({
    address,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [ownerAddress, spenderAddress],
  })
}
