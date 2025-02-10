import { ethers } from 'ethers';

import { EvmChain } from '@core/chain/Chain';
import { getEvmChainRpcUrl } from '../chainInfo';

export const getEvmBaseFee = async (chain: EvmChain) => {
  const provider = new ethers.JsonRpcProvider(getEvmChainRpcUrl(chain));
  const baseFee = await provider.getBlock('latest');

  if (!baseFee) {
    throw new Error(`Failed to get base fee for chain ${chain}`);
  }
  
  const { baseFeePerGas } = baseFee;

  if (baseFeePerGas === undefined || baseFeePerGas === null) {
    throw new Error(`Failed to get base fee per gas for chain ${chain}`);
  }

  return baseFeePerGas;
};
