import { useTranslation } from 'react-i18next';

import { useFormatFiatAmount } from '../../chain/ui/hooks/useFormatFiatAmount';
import { Spinner } from '../../lib/ui/loaders/Spinner';
import { QueryDependant } from '../../lib/ui/query/components/QueryDependant';
import { EntityWithAmount } from '../../lib/utils/entities/EntityWithAmount';
import { CoinMeta } from '../../model/coin-meta';
import { Fiat } from '../../model/fiat';
import { useCurrentVaultCoin } from '../../vault/state/currentVault';
import { CoinKey } from '../Coin';
import { useCoinPriceQuery } from '../query/useCoinPriceQuery';
import { storageCoinToCoin } from '../utils/storageCoin';

type FiatAmountProps = EntityWithAmount & {
  coin: CoinKey;
};

export const FiatAmount = ({ coin: coinKey, amount }: FiatAmountProps) => {
  const coin = useCurrentVaultCoin(coinKey);

  const query = useCoinPriceQuery(
    CoinMeta.fromCoin(storageCoinToCoin(coin)),
    Fiat.USD
  );

  const { t } = useTranslation();

  const formatAmount = useFormatFiatAmount();

  return (
    <QueryDependant
      query={query}
      success={value => formatAmount(value * amount)}
      error={() => t('failed_to_load')}
      pending={() => <Spinner />}
    />
  );
};
