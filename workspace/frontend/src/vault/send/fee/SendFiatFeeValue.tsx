import { useEffect } from 'react';

import { getFeeAmount } from '../../../chain/tx/fee/utils/getFeeAmount';
import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { chainFeeCoin } from '../../../coin/chainFeeCoin';
import { useCoinPriceQuery } from '../../../coin/query/useCoinPriceQuery';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import { useGlobalCurrency } from '../../../lib/hooks/useGlobalCurrency';
import { Spinner } from '../../../lib/ui/loaders/Spinner';
import { formatAmount } from '../../../lib/utils/formatAmount';
import { CoinMeta } from '../../../model/coin-meta';
import { useCurrentVaultCoin } from '../../state/currentVault';
import { useCurrentSendCoin } from '../state/sendCoin';
import { useSendFees } from '../state/sendFees';
import { useSendChainSpecific } from './SendChainSpecificProvider';

export const SendFiatFeeValue = () => {
  const [coinKey] = useCurrentSendCoin();
  const [, setFees] = useSendFees();
  const { globalCurrency } = useGlobalCurrency();
  const chainSpecific = useSendChainSpecific();
  const fee = getFeeAmount(chainSpecific);
  const coin = useCurrentVaultCoin(coinKey);

  const { isPending, data: price } = useCoinPriceQuery(
    CoinMeta.fromCoin(storageCoinToCoin(coin))
  );

  const { decimals } = chainFeeCoin[coinKey.chain];
  const humanReadableFeeValue = fromChainAmount(fee, decimals);

  let formattedAmount: string | null = null;

  useEffect(() => {
    if (!formattedAmount) return;

    setFees({
      type: 'send',
      networkFeesFormatted: formattedAmount,
    });
  }, [formattedAmount, setFees]);

  if (isPending) return <Spinner />;
  if (!price || !humanReadableFeeValue) return null;

  formattedAmount = formatAmount(humanReadableFeeValue * price, globalCurrency);
  return <>{formattedAmount}</>;
};
