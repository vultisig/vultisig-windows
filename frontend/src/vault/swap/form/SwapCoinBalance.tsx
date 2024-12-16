import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { CoinKey } from '../../../coin/Coin';
import { useBalanceQuery } from '../../../coin/query/useBalanceQuery';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import { Spinner } from '../../../lib/ui/loaders/Spinner';
import { ComponentWithValueProps } from '../../../lib/ui/props';
import { MatchQuery } from '../../../lib/ui/query/components/MatchQuery';
import { text } from '../../../lib/ui/text';
import { formatAmount } from '../../../lib/utils/formatAmount';
import { useCurrentVaultCoin } from '../../state/currentVault';

const Container = styled.div`
  ${text({
    color: 'supporting',
    weight: '700',
    size: 14,
    centerVertically: {
      gap: 8,
    },
  })}
`;

export const SwapCoinBalance = ({
  value,
}: ComponentWithValueProps<CoinKey>) => {
  const { t } = useTranslation();

  const coin = useCurrentVaultCoin(value);

  const query = useBalanceQuery(storageCoinToCoin(coin));

  return (
    <Container>
      <span>{t('balance')}:</span>
      <span>
        <MatchQuery
          value={query}
          pending={() => <Spinner />}
          error={() => t('failed_to_load')}
          success={({ amount, decimals }) => (
            <span>{formatAmount(fromChainAmount(amount, decimals))}</span>
          )}
        />
      </span>
    </Container>
  );
};
