import { useTranslation } from 'react-i18next';

import { CoinInfo } from '../../../coin/Coin';
import { ComponentWithValueProps } from '../../../lib/ui/props';
import { Text } from '../../../lib/ui/text';
import { formatAmount } from '../../../lib/utils/formatAmount';
import { TxOverviewRow } from './TxOverviewRow';

export const TxOverviewAmount = ({
  value,
  symbol,
}: ComponentWithValueProps<number> & Pick<CoinInfo, 'symbol'>) => {
  const { t } = useTranslation();

  return (
    <TxOverviewRow>
      <Text>{t('amount')}</Text>
      <Text family="mono">{formatAmount(value, symbol)}</Text>
    </TxOverviewRow>
  );
};
