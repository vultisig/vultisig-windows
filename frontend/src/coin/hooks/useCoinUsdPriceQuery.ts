import { useQuery } from '@tanstack/react-query';

import { queryUrl } from '../../lib/utils/query/queryUrl';
import { Endpoint } from '../../services/Endpoint';
import { CoinKey } from '../Coin';

type Price = {
  usd: number;
};

export const useCoinUsdPriceQuery = (coin: CoinKey) => {
  return useQuery({
    queryKey: ['coinUsdPrice', coin],
    queryFn: async () => {
      const endpoint = Endpoint.fetchTokenPrice(
        coin.chainId,
        [coin.id],
        'usd'
      ).toString();

      const response = await queryUrl<Record<string, Price>>(endpoint);

      return response[coin.id].usd;
    },
  });
};
