import { useQuery } from '@tanstack/react-query';

import { getThorchainSwapQuote } from '../../../../chain/thor/swap/api/getThorchainSwapQuote';
import { thorchainSwapConfig } from '../../../../chain/thor/swap/config';
import { toThorchainSwapAsset } from '../../../../chain/thor/swap/utils/toThorchainSwapAsset';
import { fromChainAmount } from '../../../../chain/utils/fromChainAmount';
import { toChainAmount } from '../../../../chain/utils/toChainAmount';
import { useCoinPriceQuery } from '../../../../coin/query/useCoinPriceQuery';
import { storageCoinToCoin } from '../../../../coin/utils/storageCoin';
import { shouldBePresent } from '../../../../lib/utils/assert/shouldBePresent';
import { CoinMeta } from '../../../../model/coin-meta';
import { Fiat } from '../../../../model/fiat';
import {
  useCurrentVaultAddress,
  useCurrentVaultCoin,
} from '../../../state/currentVault';
import { useFromAmount } from '../../state/fromAmount';
import { useFromCoin } from '../../state/fromCoin';
import { useToCoin } from '../../state/toCoin';

export const useSwapOutputAmountQuery = () => {
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

  return useQuery({
    queryKey: [
      'swapOutputAmount',
      fromCoinKey,
      toCoinKey,
      fromAmount,
      destination,
    ],
    queryFn: async () => {
      const fromAsset = toThorchainSwapAsset({
        ...fromCoinKey,
        ticker: fromCoin.ticker,
      });
      const toAsset = toThorchainSwapAsset({
        ...toCoinKey,
        ticker: toCoin.ticker,
      });

      const amount = toChainAmount(
        shouldBePresent(fromAmount),
        thorchainSwapConfig.decimals
      ).toString();

      const usdAmount =
        shouldBePresent(fromAmount) * shouldBePresent(fromCoinUsdPrice.data);

      const isAffiliate =
        usdAmount >= thorchainSwapConfig.minUsdAffiliateAmount;

      const quote = await getThorchainSwapQuote({
        fromAsset,
        toAsset,
        destination,
        amount,
        isAffiliate,
      });

      const { expected_amount_out } = quote;

      return fromChainAmount(expected_amount_out, thorchainSwapConfig.decimals);
    },
    enabled: !!fromAmount && !!fromCoinUsdPrice.data,
  });
};
