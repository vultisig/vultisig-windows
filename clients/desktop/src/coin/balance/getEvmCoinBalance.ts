import { getBalance } from 'viem/_types/actions/public/getBalance';

import { getEvmPublicClient } from '../../chain/evm/chainInfo';
import { getErc20Balance } from '../../chain/evm/erc20/getErc20Balance';
import { isNativeCoin } from '../../chain/utils/isNativeCoin';
import { EvmChain } from '../../model/chain';
import { GetCoinBalanceInput } from './GetCoinBalanceInput';

export const getEvmCoinBalance = async (
  input: GetCoinBalanceInput<EvmChain>
) => {
  return isNativeCoin(input)
    ? getBalance(getEvmPublicClient(input.chain), {
        address: input.address as `0x${string}`,
      })
    : getErc20Balance({
        chain: input.chain,
        address: input.id as `0x${string}`,
        accountAddress: input.address as `0x${string}`,
      });
};
