import { useCurrentVaultAddress } from '../../../state/currentVault';
import { useCurrentSwapCoin } from '../../state/swapCoin';

export const useSender = () => {
  const [{ chainId }] = useCurrentSwapCoin();
  return useCurrentVaultAddress(chainId);
};
