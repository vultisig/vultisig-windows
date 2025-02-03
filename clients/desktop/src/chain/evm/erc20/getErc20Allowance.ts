import { Address, erc20Abi } from 'viem';

import { EvmChain } from '../../../model/chain';
import { getEvmPublicClient } from '../chainInfo';

type Input = {
  chain: EvmChain;
  address: Address;
  ownerAddress: Address;
  spenderAddress: Address;
};

export const getErc20Allowance = async ({
  chain,
  address,
  ownerAddress,
  spenderAddress,
}: Input) => {
  const publicClient = getEvmPublicClient(chain);

  return publicClient.readContract({
    address,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [ownerAddress, spenderAddress],
  });
};
