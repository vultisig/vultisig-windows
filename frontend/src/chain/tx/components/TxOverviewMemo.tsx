import { useTranslation } from 'react-i18next';

import { ComponentWithValueProps } from '../../../lib/ui/props';
import { Text } from '../../../lib/ui/text';
import { TxOverviewRow } from './TxOverviewRow';

export const TxOverviewMemo = ({ value }: ComponentWithValueProps<string>) => {
  const { t } = useTranslation();

  return (
    <TxOverviewRow>
      <Text>{t('memo')}</Text>
      <Text weight="500" size={14}>
        {value}
      </Text>
    </TxOverviewRow>
  );
};
