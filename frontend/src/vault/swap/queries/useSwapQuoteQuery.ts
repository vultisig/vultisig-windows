import { getThorchainSwapQuote } from '../../../chain/thor/swap/api/getThorchainSwapQuote';
import { toThorchainSwapAsset } from '../../../chain/thor/swap/asset/toThorchainSwapAsset';
import { thorchainSwapConfig } from '../../../chain/thor/swap/config';
import { toChainAmount } from '../../../chain/utils/toChainAmount';
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
      fromAmount: fromAmount ?? undefined,
      fromCoinUsdPrice: fromCoinUsdPrice.data,
    },
    getQuery: ({ fromAmount, fromCoinUsdPrice }) => ({
      queryKey: getSwapQuoteQueryKey({
        fromCoinKey,
        toCoinKey,
        fromAmount,
      }),
      queryFn: async () => {
        const fromAsset = toThorchainSwapAsset({
          ...fromCoinKey,
          ticker: fromCoin.ticker,
        });
        const toAsset = toThorchainSwapAsset({
          ...toCoinKey,
          ticker: toCoin.ticker,
        });

        const amount = toChainAmount(fromAmount, thorchainSwapConfig.decimals);

        const usdAmount = fromAmount * fromCoinUsdPrice;

        const isAffiliate =
          usdAmount >= thorchainSwapConfig.minUsdAffiliateAmount;

        return getThorchainSwapQuote({
          fromAsset,
          toAsset,
          destination,
          amount,
          isAffiliate,
        });
      },
      retry: false,
    }),
  });
};
