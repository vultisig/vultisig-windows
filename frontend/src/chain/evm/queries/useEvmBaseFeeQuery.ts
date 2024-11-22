import { useQuery } from '@tanstack/react-query';

import { EvmChain } from '../../../model/chain';
import { getEvmBaseFee } from '../utils/getEvmBaseFee';

export const useEvmBaseFeeQuery = (chainId: EvmChain) => {
  return useQuery({
    queryKey: ['evmBaseFee', chainId],
    queryFn: () => getEvmBaseFee(chainId),
  });
};