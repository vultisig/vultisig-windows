import { useMemo } from 'react';

import { areEqualCoins, CoinKey } from '../../../coin/Coin';
import { getStorageCoinKey } from '../../../coin/utils/storageCoin';
import { ChildrenProp } from '../../../lib/ui/props';
import { getStateProviderSetup } from '../../../lib/ui/state/getStateProviderSetup';
import { useCurrentVaultNativeCoins } from '../../state/currentVault';
import { useFromCoin } from './fromCoin';

const { useState: useToCoin, provider: ToCoinInternalProvider } =
  getStateProviderSetup<CoinKey>('ToCoin');

export { useToCoin };

export const ToCoinProvider: React.FC<ChildrenProp> = ({ children }) => {
  const [fromCoin] = useFromCoin();

  const nativeCoins = useCurrentVaultNativeCoins();

  const initialValue = useMemo(() => {
    const coinKeys = nativeCoins.map(getStorageCoinKey);
    return coinKeys.find(coin => !areEqualCoins(coin, fromCoin)) ?? coinKeys[0];
  }, [fromCoin, nativeCoins]);

  return (
    <ToCoinInternalProvider initialValue={initialValue}>
      {children}
    </ToCoinInternalProvider>
  );
};
