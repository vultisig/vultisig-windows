import { EntityWithAmount } from '@lib/utils/entities/EntityWithAmount';
import { useTranslation } from 'react-i18next';

import { useFormatFiatAmount } from '../../chain/ui/hooks/useFormatFiatAmount';
import { Spinner } from '../../lib/ui/loaders/Spinner';
import { MatchQuery } from '../../lib/ui/query/components/MatchQuery';
import { useCurrentVaultCoin } from '../../vault/state/currentVault';
import { CoinKey } from '../Coin';
import { useCoinPriceQuery } from '../query/useCoinPriceQuery';
import { getStorageCoinKey } from '../utils/storageCoin';

type FiatAmountProps = EntityWithAmount & {
  coin: CoinKey;
};

export const FiatAmount = ({ coin: coinKey, amount }: FiatAmountProps) => {
  const coin = useCurrentVaultCoin(coinKey);

  const query = useCoinPriceQuery({
    coin: {
      ...getStorageCoinKey(coin),
      priceProviderId: coin.price_provider_id,
    },
  });

  const { t } = useTranslation();

  const formatAmount = useFormatFiatAmount();

  return (
    <MatchQuery
      value={query}
      success={value => formatAmount(value * amount)}
      error={() => t('failed_to_load')}
      pending={() => <Spinner />}
    />
  );
};
