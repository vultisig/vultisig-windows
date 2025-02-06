import { pick } from '@lib/utils/record/pick';
import { useMemo } from 'react';

import { CoinBalanceResolverInput } from '../balance/CoinBalanceResolver';
import { coinKeyToString } from '../Coin';
import { useBalancesQuery } from './useBalancesQuery';

export const useBalanceQuery = (input: CoinBalanceResolverInput) => {
  const query = useBalancesQuery([input]);

  return useMemo(() => {
    const error = query.errors[0] ?? null;

    const data = query.data?.[coinKeyToString(input)];

    return {
      data,
      ...pick(query, ['isPending', 'isLoading']),
      error,
    };
  }, [query, input]);
};
