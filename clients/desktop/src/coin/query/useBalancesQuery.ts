import { mergeRecords } from '@lib/utils/record/mergeRecords';
import { useQueries } from '@tanstack/react-query';

import { useQueriesToEagerQuery } from '../../lib/ui/query/hooks/useQueriesToEagerQuery';
import { CoinBalanceResolverInput } from '../balance/CoinBalanceResolver';
import { getCoinBalance } from '../balance/getCoinBalance';
import { coinKeyToString } from '../Coin';
import { getBalanceQueryKey } from './useBalanceQuery';

export const useBalancesQuery = (inputs: CoinBalanceResolverInput[]) => {
  const queries = useQueries({
    queries: inputs.map(input => {
      return {
        queryKey: getBalanceQueryKey(input),
        queryFn: async () => {
          const amount = await getCoinBalance(input);

          return {
            [coinKeyToString(input)]: amount,
          };
        },
      };
    }),
  });

  return useQueriesToEagerQuery({
    queries,
    joinData: data => mergeRecords(...data),
  });
};
