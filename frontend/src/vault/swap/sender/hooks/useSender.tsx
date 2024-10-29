import { useAssertCurrentVaultAddress } from '../../../state/useCurrentVault';
import { useCurrentSwapCoin } from '../../state/swapCoin';

export const useSender = () => {
  const [{ chainId }] = useCurrentSwapCoin();
  return useAssertCurrentVaultAddress(chainId);
};
