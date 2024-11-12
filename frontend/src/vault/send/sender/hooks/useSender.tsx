import { useCurrentVaultAddress } from '../../../state/currentVault';
import { useCurrentSendCoin } from '../../state/sendCoin';

export const useSender = () => {
  const [{ chainId }] = useCurrentSendCoin();
  return useCurrentVaultAddress(chainId);
};
