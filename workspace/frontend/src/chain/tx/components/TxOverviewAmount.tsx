import { EntityWithTicker } from '@lib/utils/entities/EntityWithTicker';
import { formatAmount } from '@lib/utils/formatAmount';
import { useTranslation } from 'react-i18next';

import { ValueProp } from '../../../lib/ui/props';
import { TxOverviewRow } from './TxOverviewRow';

export const TxOverviewAmount = ({
  value,
  ticker,
}: ValueProp<number> & EntityWithTicker) => {
  const { t } = useTranslation();

  return (
    <TxOverviewRow>
      <span>{t('amount')}</span>
      <span>{formatAmount(value, ticker)}</span>
    </TxOverviewRow>
  );
};
