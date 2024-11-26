import { CoinKey } from '../../../coin/Coin';
import { getStorageCoinKey } from '../../../coin/utils/storageCoin';
import { UniformColumnGrid } from '../../../lib/ui/css/uniformColumnGrid';
import { ComponentWithValueProps } from '../../../lib/ui/props';
import { isEmpty } from '../../../lib/utils/array/isEmpty';
import {
  chainActionOptionsConfig,
  ChainWithAction,
} from '../../deposit/DepositForm/chainOptionsConfig';
import { SendPrompt } from '../../send/SendPrompt';
import { useCurrentVaultNativeCoins } from '../../state/currentVault';
import { DepositPrompt } from '../DepositPrompts';
import { SwapPrompt } from '../SwapPrompt';
import { swapAvailableChains } from './config';

export const VaultPrimaryActions = ({
  value,
}: Partial<ComponentWithValueProps<CoinKey>>) => {
  const nativeCoins = useCurrentVaultNativeCoins();

  if (isEmpty(nativeCoins)) {
    return null;
  }

  const coinDerived = value ?? getStorageCoinKey(nativeCoins[0]);
  const chainId = coinDerived?.chainId?.toLowerCase() as
    | ChainWithAction
    | undefined;

  const availableChainActions = chainId
    ? chainActionOptionsConfig[chainId] || []
    : [];

  const isSwapAvailable = swapAvailableChains.some(
    chain => chain === coinDerived?.chainId
  );

  return (
    <UniformColumnGrid fullWidth gap={12}>
      <SendPrompt value={coinDerived} />
      {isSwapAvailable && <SwapPrompt value={coinDerived} />}
      {availableChainActions.length > 0 && (
        <DepositPrompt value={coinDerived} />
      )}
    </UniformColumnGrid>
  );
};
