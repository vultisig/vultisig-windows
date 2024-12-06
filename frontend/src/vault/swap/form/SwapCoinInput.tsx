import { useMemo } from 'react';

import { CoinKey } from '../../../coin/Coin';
import { CoinInputContainer } from '../../../coin/ui/inputs/CoinInputContainer';
import { SelectCoinOverlay } from '../../../coin/ui/inputs/SelectCoinOverlay';
import { Opener } from '../../../lib/ui/base/Opener';
import { InputProps } from '../../../lib/ui/props';
import { pick } from '../../../lib/utils/record/pick';
import { Chain } from '../../../model/chain';
import {
  useCurrentVaultCoin,
  useCurrentVaultCoins,
} from '../../state/currentVault';
import { swapEnabledChains } from '../swapEnabledChains';
import { SwapCoinBalance } from './SwapCoinBalance';

export const SwapCoinInput: React.FC<InputProps<CoinKey>> = ({
  value,
  onChange,
}) => {
  const coin = useCurrentVaultCoin(value);

  const coins = useCurrentVaultCoins();

  const options = useMemo(
    () => coins.filter(coin => swapEnabledChains.includes(coin.chain as Chain)),
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
