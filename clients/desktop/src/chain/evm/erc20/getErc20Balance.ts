import { Address, erc20Abi } from 'viem';

import { EvmChain } from '../../../model/chain';
import { getEvmPublicClient } from '../chainInfo';

type Input = {
  chain: EvmChain;
  address: Address;
  accountAddress: Address;
};

export const getErc20Balance = async ({
  chain,
  address,
  accountAddress,
}: Input) => {
  const publicClient = getEvmPublicClient(chain);

  return publicClient.readContract({
    address,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [accountAddress],
  });
};
