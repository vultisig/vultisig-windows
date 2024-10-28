import { Link } from 'react-router-dom';

import { CoinKey, coinKeyToString } from '../../coin/Coin';
import { Button } from '../../lib/ui/buttons/Button';
import { ComponentWithValueProps } from '../../lib/ui/props';
import { makeAppPath } from '../../navigation';

export const SwapPrompt = ({ value }: ComponentWithValueProps<CoinKey>) => {
  return (
    <Link
      to={makeAppPath('vaultItemSwap', {
        coin: coinKeyToString(value),
      })}
    >
      <Button as="div" kind="outlined" style={{ textTransform: 'uppercase' }}>
        SWAP
      </Button>
    </Link>
  );
};
