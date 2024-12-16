import {
  SwapEnabledChain,
  swapEnabledChains,
} from '../../../chain/swap/swapChains';
import { CoinKey } from '../../../coin/Coin';
import { getStorageCoinKey } from '../../../coin/utils/storageCoin';
import { UniformColumnGrid } from '../../../lib/ui/css/uniformColumnGrid';
import { ComponentWithValueProps } from '../../../lib/ui/props';
import { isEmpty } from '../../../lib/utils/array/isEmpty';
import { SendPrompt } from '../../send/SendPrompt';
import { useCurrentVaultNativeCoins } from '../../state/currentVault';
import { SwapPrompt } from '../../swap/components/SwapPrompt';
import { DepositPrompt } from '../DepositPrompts';

export const VaultPrimaryActions = ({
  value,
}: Partial<ComponentWithValueProps<CoinKey>>) => {
  const nativeCoins = useCurrentVaultNativeCoins();

  if (isEmpty(nativeCoins)) {
    return null;
  }

  const coinKey = value ?? getStorageCoinKey(nativeCoins[0]);

  const isSwapAvailable = swapEnabledChains.includes(
    coinKey.chain as SwapEnabledChain
  );

  return (
    <UniformColumnGrid fullWidth gap={12}>
      <SendPrompt value={coinKey} />
      {isSwapAvailable && <SwapPrompt value={coinKey} />}
      <DepositPrompt value={coinKey} />
    </UniformColumnGrid>
  );
};
