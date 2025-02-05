import { EvmChain } from '../../../model/chain';
import { FeePriority } from '../../fee/FeePriority';
import { getEvmPublicClient } from '../chainInfo';

export const getEvmMaxPriorityFee = async (
  chain: EvmChain
): Promise<Record<FeePriority, number>> => {
  const publicClient = getEvmPublicClient(chain);

  const maxPriorityFeePerGas =
    await publicClient.estimateMaxPriorityFeePerGas();
  const basePriorityFee = Number(maxPriorityFeePerGas);

  return {
    low: Math.floor(basePriorityFee * 0.8),
    normal: basePriorityFee,
    fast: Math.floor(basePriorityFee * 1.5),
  };
};
