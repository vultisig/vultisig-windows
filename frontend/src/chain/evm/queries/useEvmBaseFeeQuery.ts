import { useQuery } from '@tanstack/react-query';

import { EvmChain } from '../../../model/chain';
import { getEvmBaseFee } from '../utils/getEvmBaseFee';

export const useEvmBaseFeeQuery = (chain: EvmChain) => {
  return useQuery({
    queryKey: ['evmBaseFee', chain],
    queryFn: () => getEvmBaseFee(chain),
  });
};
