import { useTranslation } from 'react-i18next';

import {
  BalanceQueryResult,
  useBalanceQuery,
} from '../../../../coin/query/useBalanceQuery';
import { storageCoinToCoin } from '../../../../coin/utils/storageCoin';
import { Spinner } from '../../../../lib/ui/loaders/Spinner';
import {
  QueryDependant,
  QueryDependantWrapperProps,
} from '../../../../lib/ui/query/components/QueryDependant';
import { useAssertCurrentVaultCoin } from '../../../state/useCurrentVault';
import { useCurrentSendCoin } from '../../state/sendCoin';

export const SendCoinBalanceDependant: React.FC<
  QueryDependantWrapperProps<BalanceQueryResult>
> = props => {
  const [coinKey] = useCurrentSendCoin();
  const coin = useAssertCurrentVaultCoin(coinKey);

  const query = useBalanceQuery(storageCoinToCoin(coin));

  const { t } = useTranslation();

  return (
    <QueryDependant
      query={query}
      pending={() => <Spinner />}
      error={() => t('failed_to_load')}
      {...props}
    />
  );
};
