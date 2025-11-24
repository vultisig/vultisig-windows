import { EvmChain } from '@core/chain/Chain'
import { getEvmClient } from '@core/chain/chains/evm/client'
import { erc20Abi } from 'viem'

import { AccountCoinKey } from '../../../coin/AccountCoin'
import { Token } from '../../../coin/Coin'

type GetErc20AllowanceInput = Token<AccountCoinKey<EvmChain>> & {
  spender: string
}

export const getErc20Allowance = async ({
  chain,
  id,
  address,
  spender,
}: GetErc20AllowanceInput) => {
  const publicClient = getEvmClient(chain)

  return publicClient.readContract({
    address: id as `0x${string}`,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [address as `0x${string}`, spender as `0x${string}`],
  })
}
