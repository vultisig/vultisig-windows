import { CoinKey } from '../../../coin/Coin';
import { getStorageCoinKey } from '../../../coin/utils/storageCoin';
import { UniformColumnGrid } from '../../../lib/ui/css/uniformColumnGrid';
import { ComponentWithValueProps } from '../../../lib/ui/props';
import { isEmpty } from '../../../lib/utils/array/isEmpty';
import { SendPrompt } from '../../send/SendPrompt';
import { useCurrentVaultNativeCoins } from '../../state/currentVault';
import { SwapPrompt } from '../../swap/components/SwapPrompt';
import { swapEnabledChains } from '../../swap/swapEnabledChains';
import { DepositPrompt } from '../DepositPrompts';

export const VaultPrimaryActions = ({
  value,
}: Partial<ComponentWithValueProps<CoinKey>>) => {
  const nativeCoins = useCurrentVaultNativeCoins();

  if (isEmpty(nativeCoins)) {
    return null;
  }

  const coinKey = value ?? getStorageCoinKey(nativeCoins[0]);

  const isSwapAvailable = swapEnabledChains.includes(coinKey.chainId);

  return (
    <UniformColumnGrid fullWidth gap={12}>
      <SendPrompt value={coinKey} />
      {isSwapAvailable && <SwapPrompt value={coinKey} />}
      <DepositPrompt value={coinKey} />
    </UniformColumnGrid>
  );
};
