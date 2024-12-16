import { useTranslation } from 'react-i18next';

import {
  BalanceQueryResult,
  useBalanceQuery,
} from '../../../../coin/query/useBalanceQuery';
import { storageCoinToCoin } from '../../../../coin/utils/storageCoin';
import { Spinner } from '../../../../lib/ui/loaders/Spinner';
import {
  MatchQuery,
  MatchQueryWrapperProps,
} from '../../../../lib/ui/query/components/MatchQuery';
import { useCurrentVaultCoin } from '../../../state/currentVault';
import { useCurrentSendCoin } from '../../state/sendCoin';

export const SendCoinBalanceDependant: React.FC<
  MatchQueryWrapperProps<BalanceQueryResult>
> = props => {
  const [coinKey] = useCurrentSendCoin();
  const coin = useCurrentVaultCoin(coinKey);

  const query = useBalanceQuery(storageCoinToCoin(coin));

  const { t } = useTranslation();

  return (
    <MatchQuery
      value={query}
      pending={() => <Spinner />}
      error={() => t('failed_to_load')}
      {...props}
    />
  );
};
