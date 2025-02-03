import { useMemo } from 'react';

import { swapEnabledChains } from '../../../chain/swap/swapEnabledChains';
import { CoinKey } from '../../../coin/Coin';
import { CoinInputContainer } from '../../../coin/ui/inputs/CoinInputContainer';
import { SelectCoinOverlay } from '../../../coin/ui/inputs/SelectCoinOverlay';
import { Opener } from '../../../lib/ui/base/Opener';
import { InputProps } from '../../../lib/ui/props';
import { isOneOf } from '@lib/utils/array/isOneOf';
import { pick } from '@lib/utils/record/pick';
import {
  useCurrentVaultCoin,
  useCurrentVaultCoins,
} from '../../state/currentVault';
import { SwapCoinBalance } from './SwapCoinBalance';

export const SwapCoinInput: React.FC<InputProps<CoinKey>> = ({
  value,
  onChange,
}) => {
  const coin = useCurrentVaultCoin(value);

  const coins = useCurrentVaultCoins();

  const options = useMemo(
    () => coins.filter(coin => isOneOf(coin.chain, swapEnabledChains)),
    [coins]
  );

  return (
    <Opener
      renderOpener={({ onOpen }) => (
        <CoinInputContainer
          value={{ ...value, ...pick(coin, ['logo', 'ticker']) }}
          onClick={onOpen}
        >
          <SwapCoinBalance value={value} />
        </CoinInputContainer>
      )}
      renderContent={({ onClose }) => (
        <SelectCoinOverlay
          onFinish={newValue => {
            if (newValue) {
              onChange(newValue);
            }
            onClose();
          }}
          options={options}
        />
      )}
    />
  );
};
