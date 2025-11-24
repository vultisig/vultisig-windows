import { EvmChain } from '@core/chain/Chain'
import { getEvmClient } from '@core/chain/chains/evm/client'
import { Address, erc721Abi } from 'viem'

const THORGUARD_NFT_ADDRESS =
  '0xa98b29a8f5a247802149c268ecf860b8308b7291' as Address

type Input = {
  chain: EvmChain
  address: Address
}

export const hasThorguardNft = async ({
  chain,
  address,
}: Input): Promise<boolean> => {
  try {
    const publicClient = getEvmClient(chain)

    const balance = await publicClient.readContract({
      address: THORGUARD_NFT_ADDRESS,
      abi: erc721Abi,
      functionName: 'balanceOf',
      args: [address],
    })

    return balance > 0n
  } catch {
    return false
  }
}
