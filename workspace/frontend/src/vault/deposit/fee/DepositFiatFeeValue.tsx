import { getFeeAmount } from '../../../chain/tx/fee/utils/getFeeAmount';
import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { chainFeeCoin } from '../../../coin/chainFeeCoin';
import { useCoinPriceQuery } from '../../../coin/query/useCoinPriceQuery';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import { useGlobalCurrency } from '../../../lib/hooks/useGlobalCurrency';
import { Spinner } from '../../../lib/ui/loaders/Spinner';
import { MatchQuery } from '../../../lib/ui/query/components/MatchQuery';
import { formatAmount } from '../../../lib/utils/formatAmount';
import { CoinMeta } from '../../../model/coin-meta';
import { useCurrentVaultCoin } from '../../state/currentVault';
import { useCurrentDepositCoin } from '../hooks/useCurrentDepositCoin';
import { useDepositChainSpecific } from './DepositChainSpecificProvider';

export const DepositFiatFeeValue = () => {
  const [coinKey] = useCurrentDepositCoin();
  const coin = useCurrentVaultCoin(coinKey);
  const priceQuery = useCoinPriceQuery(
    CoinMeta.fromCoin(storageCoinToCoin(coin))
  );

  const { globalCurrency } = useGlobalCurrency();

  const chainSpecific = useDepositChainSpecific();

  const { decimals } = chainFeeCoin[coinKey.chain];

  const fee = getFeeAmount(chainSpecific);

  const feeAmount = fromChainAmount(fee, decimals);

  return (
    <MatchQuery
      value={priceQuery}
      pending={() => <Spinner />}
      error={() => null}
      success={price => {
        const formattedAmount = formatAmount(feeAmount * price, globalCurrency);

        return formattedAmount;
      }}
    />
  );
};
