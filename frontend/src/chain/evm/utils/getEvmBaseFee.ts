import { ethers } from 'ethers';

import { EvmChain } from '../../../model/chain';
import { evmRpcUrl } from '../evmRpcUrl';

export const getEvmBaseFee = async (chainId: EvmChain) => {
  const provider = new ethers.JsonRpcProvider(evmRpcUrl[chainId]);
  const baseFee = await provider.getBlock('latest');

  if (!baseFee) {
    throw new Error(`Failed to get base fee for chain ${chainId}`);
  }

  const { baseFeePerGas } = baseFee;

  if (!baseFeePerGas) {
    throw new Error(`Failed to get base fee per gas for chain ${chainId}`);
  }

  return baseFeePerGas;
};
