import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { useCoinPriceQuery } from '../../../coin/query/useCoinPriceQuery';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import { useGlobalCurrency } from '../../../lib/hooks/useGlobalCurrency';
import { Spinner } from '../../../lib/ui/loaders/Spinner';
import { QueryDependant } from '../../../lib/ui/query/components/QueryDependant';
import { formatAmount } from '../../../lib/utils/formatAmount';
import { CoinMeta } from '../../../model/coin-meta';
import {
  useAssertCurrentVaultCoin,
  useAssertCurrentVaultNativeCoin,
} from '../../state/useCurrentVault';
import { useCurrentSendCoin } from '../state/sendCoin';
import { useSendSpecificTxInfo } from './SendSpecificTxInfoProvider';

export const SendFiatFeeValue = () => {
  const [coinKey] = useCurrentSendCoin();
  const coin = useAssertCurrentVaultCoin(coinKey);
  const { decimals } = useAssertCurrentVaultNativeCoin(coinKey.chainId);
  const priceQuery = useCoinPriceQuery(
    CoinMeta.fromCoin(storageCoinToCoin(coin))
  );

  const { globalCurrency } = useGlobalCurrency();

  const { fee } = useSendSpecificTxInfo();

  const feeAmount = fromChainAmount(fee, decimals);

  return (
    <QueryDependant
      query={priceQuery}
      pending={() => <Spinner />}
      error={() => null}
      success={price => {
        const formattedAmount = formatAmount(feeAmount * price, globalCurrency);

        return `~${formattedAmount}`;
      }}
    />
  );
};
