import { CoinKey } from '../../coin/Coin';
import { getStorageCoinKey } from '../../coin/utils/storageCoin';
import { UniformColumnGrid } from '../../lib/ui/css/uniformColumnGrid';
import { ComponentWithValueProps } from '../../lib/ui/props';
import { isEmpty } from '../../lib/utils/array/isEmpty';
import { SendPrompt } from '../send/SendPrompt';
import { useAssertCurrentVaultNativeCoins } from '../state/useCurrentVault';
import { SwapPrompt } from './SwapPrompt';

export const VaultPrimaryActions = ({
  value,
}: Partial<ComponentWithValueProps<CoinKey>>) => {
  const nativeCoins = useAssertCurrentVaultNativeCoins();

  if (isEmpty(nativeCoins)) {
    return null;
  }

  const sendInitialCoin = value ?? getStorageCoinKey(nativeCoins[0]);

  return (
    <UniformColumnGrid fullWidth gap={12}>
      <SendPrompt value={sendInitialCoin} />
      <SwapPrompt value={sendInitialCoin} />
    </UniformColumnGrid>
  );
};
