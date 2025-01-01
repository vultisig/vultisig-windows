import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { CoinKey, coinKeyToString } from '../../coin/Coin';
import { Button } from '../../lib/ui/buttons/Button';
import { ComponentWithValueProps } from '../../lib/ui/props';
import { isOneOf } from '../../lib/utils/array/isOneOf';
import { makeAppPath } from '../../navigation';
import { depositEnabledChains } from '../deposit/DepositEnabledChain';

export const DepositPrompt = ({ value }: ComponentWithValueProps<CoinKey>) => {
  const { t } = useTranslation();

  const chain = isOneOf(value.chain, depositEnabledChains);

  if (!chain) {
    return null;
  }

  return (
    <Link
      to={makeAppPath('deposit', {
        coin: coinKeyToString(value),
      })}
    >
      <Button as="div" kind="outlined" style={{ textTransform: 'uppercase' }}>
        {t('deposit')}
      </Button>
    </Link>
  );
};
