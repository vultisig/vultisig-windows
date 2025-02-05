import { getEvmPublicClient } from '../../chain/evm/chainInfo';
import { getErc20Balance } from '../../chain/evm/erc20/getErc20Balance';
import { isNativeCoin } from '../../chain/utils/isNativeCoin';
import { EvmChain } from '../../model/chain';
import { CoinBalanceResolver } from './CoinBalanceResolver';

export const getEvmCoinBalance: CoinBalanceResolver<EvmChain> = async input => {
  return isNativeCoin(input)
    ? getEvmPublicClient(input.chain).getBalance({
        address: input.address as `0x${string}`,
      })
    : getErc20Balance({
        chain: input.chain,
        address: input.id as `0x${string}`,
        accountAddress: input.address as `0x${string}`,
      });
};
