import { findNativeSwapQuote } from '../../../chain/swap/native/api/findNativeSwapQuote';
import { toNativeSwapAsset } from '../../../chain/swap/native/asset/toNativeSwapAsset';
import { nativeSwapAffiliateConfig } from '../../../chain/swap/native/nativeSwapAffiliateConfig';
import { CoinKey } from '../../../coin/Coin';
import { useCoinPriceQuery } from '../../../coin/query/useCoinPriceQuery';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import { useStateDependentQuery } from '../../../lib/ui/query/hooks/useStateDependentQuery';
import { withoutNullOrUndefined } from '../../../lib/utils/array/withoutNullOrUndefined';
import { CoinMeta } from '../../../model/coin-meta';
import { Fiat } from '../../../model/fiat';
import {
  useCurrentVaultAddress,
  useCurrentVaultCoin,
} from '../../state/currentVault';
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

  const destination = useCurrentVaultAddress(toCoin.chain);

  const fromCoinUsdPrice = useCoinPriceQuery(
    CoinMeta.fromCoin(storageCoinToCoin(fromCoin)),
    Fiat.USD
  );

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
        const fromAsset = toNativeSwapAsset({
          ...fromCoinKey,
          ticker: fromCoin.ticker,
        });
        const toAsset = toNativeSwapAsset({
          ...toCoinKey,
          ticker: toCoin.ticker,
        });

        const usdAmount = fromAmount * fromCoinUsdPrice;

        const isAffiliate =
          usdAmount >= nativeSwapAffiliateConfig.minUsdAffiliateAmount;

        return findNativeSwapQuote({
          fromAsset,
          toAsset,
          destination,
          amount: fromAmount,
          isAffiliate,
        });
      },
      retry: false,
    }),
  });
};
