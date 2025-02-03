import { useCurrentVaultAddress } from '../../state/currentVault';
import { useCurrentDepositCoin } from './useCurrentDepositCoin';

export const useSender = () => {
  const [{ chain }] = useCurrentDepositCoin();
  return useCurrentVaultAddress(chain);
};
