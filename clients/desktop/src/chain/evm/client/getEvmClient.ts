import { memoize } from '@lib/utils/memoize';
import { createPublicClient, http, PublicClient } from 'viem';

import { EvmChain } from '../../../model/chain';
import { evmChainInfo } from '../chainInfo';

export const getEvmClient = memoize((chain: EvmChain): PublicClient => {
  return createPublicClient({
    chain: evmChainInfo[chain],
    transport: http(),
  });
});
