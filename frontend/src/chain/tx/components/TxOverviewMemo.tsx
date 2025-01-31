import { useTranslation } from 'react-i18next';

import { ValueProp } from '../../../lib/ui/props';
import { TxOverviewChainDataRow } from './TxOverviewRow';

export const TxOverviewMemo = ({ value }: ValueProp<string>) => {
  const { t } = useTranslation();

  return (
    <TxOverviewChainDataRow>
      <span>{t('memo')}</span>
      <span>{value}</span>
    </TxOverviewChainDataRow>
  );
};
