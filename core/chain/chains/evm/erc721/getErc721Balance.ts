import { EvmChain } from '@core/chain/Chain'
import { getEvmClient } from '@core/chain/chains/evm/client'
import { Address, erc721Abi } from 'viem'

export type GetErc721BalanceInput = {
  chain: EvmChain
  address: Address
  accountAddress: Address
}

export const getErc721Balance = async ({
  chain,
  address,
  accountAddress,
}: GetErc721BalanceInput) => {
  const publicClient = getEvmClient(chain)

  return publicClient.readContract({
    address,
    abi: erc721Abi,
    functionName: 'balanceOf',
    args: [accountAddress],
  })
}
