import { ethers } from 'ethers';

import { EvmChain } from '../../../model/chain';
import { getEvmChainRpcUrl } from '../chainInfo';

export const getEvmBaseFee = async (chain: EvmChain) => {
  const provider = new ethers.JsonRpcProvider(getEvmChainRpcUrl(chain));
  const baseFee = await provider.getBlock('latest');

  if (!baseFee) {
    throw new Error(`Failed to get base fee for chain ${chain}`);
  }

  const { baseFeePerGas } = baseFee;

  if (!baseFeePerGas) {
    throw new Error(`Failed to get base fee per gas for chain ${chain}`);
  }

  return baseFeePerGas;
};
