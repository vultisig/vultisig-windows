import { useCurrentVaultAddress } from '../../state/currentVault';
import { useCurrentDepositCoin } from './useCurrentDepositCoin';

export const useSender = () => {
  const [{ chainId }] = useCurrentDepositCoin();
  return useCurrentVaultAddress(chainId);
};
