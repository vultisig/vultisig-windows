import { useQuery } from '@tanstack/react-query';

import { CoinBalanceResolverInput } from '../balance/CoinBalanceResolver';
import { getCoinBalance } from '../balance/getCoinBalance';

export const getBalanceQueryKey = (input: CoinBalanceResolverInput) => [
  'coinBalance',
  input,
];

export const useBalanceQuery = (input: CoinBalanceResolverInput) => {
  return useQuery({
    queryKey: getBalanceQueryKey(input),
    queryFn: () => getCoinBalance(input),
  });
};
