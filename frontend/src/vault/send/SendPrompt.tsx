import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { CoinKey, coinKeyToString } from '../../coin/Coin';
import { Button } from '../../lib/ui/buttons/Button';
import { ComponentWithValueProps } from '../../lib/ui/props';
import { makeAppPath } from '../../navigation';

export const SendPrompt = ({ value }: ComponentWithValueProps<CoinKey>) => {
  const { t } = useTranslation();

  return (
    <Link
      to={makeAppPath('send', {
        coin: coinKeyToString(value),
      })}
    >
      <Button as="div" kind="outlined" style={{ textTransform: 'uppercase' }}>
        {t('send')}
      </Button>
    </Link>
  );
};
