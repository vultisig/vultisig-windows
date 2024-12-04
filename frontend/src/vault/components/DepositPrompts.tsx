import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { CoinKey, coinKeyToString } from '../../coin/Coin';
import { Button } from '../../lib/ui/buttons/Button';
import { ComponentWithValueProps } from '../../lib/ui/props';
import { isEmpty } from '../../lib/utils/array/isEmpty';
import { makeAppPath } from '../../navigation';
import {
  chainDepositOptionsConfig,
  ChainWithAction,
} from '../deposit/DepositForm/chainOptionsConfig';

export const DepositPrompt = ({ value }: ComponentWithValueProps<CoinKey>) => {
  const { t } = useTranslation();

  const chainId = value.chainId?.toLowerCase() as ChainWithAction | undefined;

  const availableChainActions = chainId
    ? chainDepositOptionsConfig[chainId] || []
    : [];

  if (isEmpty(availableChainActions)) {
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
