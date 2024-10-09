import { useAssertCurrentVaultAddress } from '../../../state/useCurrentVault';
import { useCurrentSendCoin } from '../../state/sendCoin';

export const useSender = () => {
  const [{ chainId }] = useCurrentSendCoin();
  return useAssertCurrentVaultAddress(chainId);
};
