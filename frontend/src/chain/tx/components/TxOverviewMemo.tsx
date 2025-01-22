import { useTranslation } from 'react-i18next';

import { ComponentWithValueProps } from '../../../lib/ui/props';
import { TxOverviewRow } from './TxOverviewRow';

export const TxOverviewMemo = ({ value }: ComponentWithValueProps<string>) => {
  const { t } = useTranslation();

  return (
    <TxOverviewRow>
      <span>{t('memo')}</span>
      <span>{value}</span>
    </TxOverviewRow>
  );
};
