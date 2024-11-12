import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { useCoinPriceQuery } from '../../../coin/query/useCoinPriceQuery';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import { useGlobalCurrency } from '../../../lib/hooks/useGlobalCurrency';
import { formatAmount } from '../../../lib/utils/formatAmount';
import { CoinMeta } from '../../../model/coin-meta';
import { useCurrentVaultCoin } from '../../state/currentVault';
import { useSwapQuote } from '../state/selected-quote';
import { useCurrentSwapCoin } from '../state/swapCoin';
import { useSendSpecificTxInfo } from './SendSpecificTxInfoProvider';

export default function TotalFeeUsd() {
  const [coinKey] = useCurrentSwapCoin();
  const coin = useCurrentVaultCoin(coinKey);
  const [selectedSwapQuote] = useSwapQuote();
  const priceQuery = useCoinPriceQuery(
    CoinMeta.fromCoin(storageCoinToCoin(coin))
  );

  const { globalCurrency } = useGlobalCurrency();

  const { fee } = useSendSpecificTxInfo();

  const feeAmount = fromChainAmount(fee, coin.decimals);
  return (
    <span className={`font-medium text-neutral-300`}>
      {formatAmount(
        feeAmount * (priceQuery.data || 0) +
          (selectedSwapQuote ? +selectedSwapQuote.fees.totalInUsd : 0),
        globalCurrency
      )}
    </span>
  );
}
