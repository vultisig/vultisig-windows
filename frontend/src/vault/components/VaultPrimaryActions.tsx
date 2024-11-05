import { CoinKey } from '../../coin/Coin';
import { getStorageCoinKey } from '../../coin/utils/storageCoin';
import { UniformColumnGrid } from '../../lib/ui/css/uniformColumnGrid';
import { ComponentWithValueProps } from '../../lib/ui/props';
import { isEmpty } from '../../lib/utils/array/isEmpty';
import { SendPrompt } from '../send/SendPrompt';
import { useAssertCurrentVaultNativeCoins } from '../state/useCurrentVault';
import { DepositPrompt } from './DepositPrompts';
import { SwapPrompt } from './SwapPrompt';

const depositFeatureEnabledChains = new Set(['THORChain']);

export const VaultPrimaryActions = ({
  value,
}: Partial<ComponentWithValueProps<CoinKey>>) => {
  const nativeCoins = useAssertCurrentVaultNativeCoins();

  if (isEmpty(nativeCoins)) {
    return null;
  }

  const sendInitialCoin = value ?? getStorageCoinKey(nativeCoins[0]);

  const isDepositFeatureEnabled = value
    ? depositFeatureEnabledChains.has(value.chainId)
    : false;

  return (
    <UniformColumnGrid fullWidth gap={12}>
      <SendPrompt value={sendInitialCoin} />
      <SwapPrompt value={sendInitialCoin} />
      {isDepositFeatureEnabled && <DepositPrompt value={sendInitialCoin} />}
    </UniformColumnGrid>
  );
};
