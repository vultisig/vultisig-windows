import { getNativeSwapQuote } from '../../../chain/swap/native/api/getNativeSwapQuote';
import { toNativeSwapAsset } from '../../../chain/swap/native/asset/toNativeSwapAsset';
import { nativeSwapAffiliateConfig } from '../../../chain/swap/native/nativeSwapAffiliateConfig';
import { NativeSwapChain } from '../../../chain/swap/native/NativeSwapChain';
import { getChainPrimaryCoin } from '../../../chain/utils/getChainPrimaryCoin';
import { toChainAmount } from '../../../chain/utils/toChainAmount';
import { CoinKey } from '../../../coin/Coin';
import { useCoinPriceQuery } from '../../../coin/query/useCoinPriceQuery';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import { useStateDependentQuery } from '../../../lib/ui/query/hooks/useStateDependentQuery';
import { withoutNullOrUndefined } from '../../../lib/utils/array/withoutNullOrUndefined';
import { Chain } from '../../../model/chain';
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

  const swapChain: NativeSwapChain = Chain.THORChain;

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
        const fromAsset = toNativeSwapAsset({
          ...fromCoinKey,
          ticker: fromCoin.ticker,
        });
        const toAsset = toNativeSwapAsset({
          ...toCoinKey,
          ticker: toCoin.ticker,
        });

        const { decimals } = getChainPrimaryCoin(swapChain);

        const amount = toChainAmount(fromAmount, decimals);

        const usdAmount = fromAmount * fromCoinUsdPrice;

        const isAffiliate =
          usdAmount >= nativeSwapAffiliateConfig.minUsdAffiliateAmount;

        return getNativeSwapQuote({
          swapChain,
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
