import { useTranslation } from 'react-i18next';

import { ComponentWithValueProps } from '../../../lib/ui/props';
import { Text } from '../../../lib/ui/text';
import { EntityWithTicker } from '../../../lib/utils/entities/EntityWithTicker';
import { formatAmount } from '../../../lib/utils/formatAmount';
import { TxOverviewRow } from './TxOverviewRow';

export const TxOverviewAmount = ({
  value,
  ticker,
}: ComponentWithValueProps<number> & EntityWithTicker) => {
  const { t } = useTranslation();

  return (
    <TxOverviewRow>
      <Text>{t('amount')}</Text>
      <Text family="mono">{formatAmount(value, ticker)}</Text>
    </TxOverviewRow>
  );
};
