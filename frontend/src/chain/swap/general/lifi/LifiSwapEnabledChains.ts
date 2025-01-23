import { ChainId } from '@lifi/sdk';

import { makeRecord } from '../../../../lib/utils/record/makeRecord';
import { Chain, EvmChain } from '../../../../model/chain';
import { getEvmChainId } from '../../../evm/chainInfo';

export const lifiSwapEnabledChains = [
  ...Object.values(EvmChain),
  Chain.Solana,
] as const;

export type LifiSwapEnabledChain = (typeof lifiSwapEnabledChains)[number];

export const lifiSwapChainId: Record<LifiSwapEnabledChain, ChainId> = {
  ...makeRecord(Object.values(EvmChain), getEvmChainId),
  [Chain.Solana]: ChainId.SOL,
};
