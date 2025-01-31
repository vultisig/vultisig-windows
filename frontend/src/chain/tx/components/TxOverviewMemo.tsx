import { useTranslation } from 'react-i18next';

import { ComponentWithValueProps } from '../../../lib/ui/props';
import { TxOverviewChainDataRow } from './TxOverviewRow';

export const TxOverviewMemo = ({ value }: ComponentWithValueProps<string>) => {
  const { t } = useTranslation();

  return (
    <TxOverviewChainDataRow>
      <span>{t('memo')}</span>
      <span>{value}</span>
    </TxOverviewChainDataRow>
  );
};
