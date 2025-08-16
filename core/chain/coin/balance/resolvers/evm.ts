import { EvmChain } from '@core/chain/Chain'
import { getEvmClient } from '@core/chain/chains/evm/client'
import { getErc20Balance } from '@core/chain/chains/evm/erc20/getErc20Balance'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'

import { CoinBalanceResolver } from '../resolver'

export const getEvmCoinBalance: CoinBalanceResolver<EvmChain> = async input => {
  return isFeeCoin(input)
    ? getEvmClient(input.chain).getBalance({
        address: input.address as `0x${string}`,
      })
    : getErc20Balance({
        chain: input.chain,
        address: input.id as `0x${string}`,
        accountAddress: input.address as `0x${string}`,
      })
}
