import { useQuery } from '@tanstack/react-query';

import { getChainSpecific } from '../../chain/keysign/chainSpecific/getChainSpecific';
import { GetChainSpecificInput } from '../../chain/keysign/chainSpecific/GetChainSpecificInput';
import { withoutUndefined } from '../../lib/utils/array/withoutUndefined';

export const chainSpecificQueryKeyPrefix = 'chainSpecific';

export const getChainSpecificQueryKey = (input: GetChainSpecificInput) =>
  withoutUndefined([chainSpecificQueryKeyPrefix, ...Object.values(input)]);

export const useChainSpecificQuery = (input: GetChainSpecificInput) => {
  return useQuery({
    queryKey: getChainSpecificQueryKey(input),
    queryFn: () => getChainSpecific(input),
  });
};
