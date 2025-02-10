import { useQuery } from '@tanstack/react-query';

import { EvmChain } from '@core/chain/Chain';
import { getEvmBaseFee } from '../utils/getEvmBaseFee';

export const useEvmBaseFeeQuery = (chain: EvmChain) => {
  return useQuery({
    queryKey: ['evmBaseFee', chain],
    queryFn: () => getEvmBaseFee(chain),
  });
};
