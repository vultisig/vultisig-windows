import { withoutNullOrUndefined } from '@lib/utils/array/withoutNullOrUndefined';
import { pick } from '@lib/utils/record/pick';

import { swapConfig } from '../../../chain/swap/config';
import { findSwapQuote } from '../../../chain/swap/quote/findSwapQuote';
import { CoinKey } from '../../../coin/Coin';
import { useCoinPriceQuery } from '../../../coin/query/useCoinPriceQuery';
import { useStateDependentQuery } from '../../../lib/ui/query/hooks/useStateDependentQuery';
import { useCurrentVaultCoin } from '../../state/currentVault';
import { useFromAmount } from '../state/fromAmount';
import { useFromCoin } from '../state/fromCoin';
import { useToCoin } from '../state/toCoin';

type GetSwapQuoteQueryKey = {
  fromCoinKey: CoinKey;
  toCoinKey: CoinKey;
  fromAmount: number;
};

export const getSwapQuoteQueryKey = ({
  fromCoinKey,
  toCoinKey,
  fromAmount,
}: GetSwapQuoteQueryKey) =>
  withoutNullOrUndefined(['swapQuote', fromCoinKey, toCoinKey, fromAmount]);

export const useSwapQuoteQuery = () => {
  const [fromCoinKey] = useFromCoin();
  const [toCoinKey] = useToCoin();
  const [fromAmount] = useFromAmount();

  const fromCoin = useCurrentVaultCoin(fromCoinKey);
  const toCoin = useCurrentVaultCoin(toCoinKey);

  const fromCoinUsdPrice = useCoinPriceQuery({
    coin: {
      ...fromCoinKey,
      priceProviderId: fromCoin.price_provider_id,
    },
    fiatCurrency: 'usd',
  });

  return useStateDependentQuery({
    state: {
      fromAmount: fromAmount || undefined,
      fromCoinUsdPrice: fromCoinUsdPrice.data,
    },
    getQuery: ({ fromAmount, fromCoinUsdPrice }) => ({
      queryKey: getSwapQuoteQueryKey({
        fromCoinKey,
        toCoinKey,
        fromAmount,
      }),
      queryFn: async () => {
        const usdAmount = fromAmount * fromCoinUsdPrice;

        const isAffiliate = usdAmount >= swapConfig.minUsdAffiliateAmount;

        return findSwapQuote({
          from: {
            ...fromCoinKey,
            ...pick(fromCoin, ['ticker', 'decimals', 'address']),
          },
          to: {
            ...toCoinKey,
            ...pick(toCoin, ['ticker', 'decimals', 'address']),
          },
          amount: fromAmount,
          isAffiliate,
        });
      },
      retry: false,
    }),
  });
};
