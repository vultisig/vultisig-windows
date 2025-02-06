import { Address, erc20Abi } from 'viem';

import { EvmChain } from '../../../model/chain';
import { getEvmClient } from '../client/getEvmClient';

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
  const publicClient = getEvmClient(chain);

  return publicClient.readContract({
    address,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [ownerAddress, spenderAddress],
  });
};
