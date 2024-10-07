import { CoinKey } from '../../coin/Coin';
import { getStorageCoinKey } from '../../coin/utils/storageCoin';
import { Button } from '../../lib/ui/buttons/Button';
import { UniformColumnGrid } from '../../lib/ui/css/uniformColumnGrid';
import { ComponentWithValueProps } from '../../lib/ui/props';
import { Text } from '../../lib/ui/text';
import { isEmpty } from '../../lib/utils/array/isEmpty';
import { SendPrompt } from '../send/SendPrompt';
import { useAssertCurrentVaultNativeCoins } from '../state/useCurrentVault';
import { SendCoinPromptDeprecated } from './sendDeprecated/SendCoinPromptDeprecated';

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
      <SendCoinPromptDeprecated />
      <SendPrompt value={sendInitialCoin} />
      <Button kind="outlined">
        <Text color="primaryAlt">SWAP</Text>
      </Button>
    </UniformColumnGrid>
  );
};
