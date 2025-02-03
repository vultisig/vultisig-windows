import { useQuery } from '@tanstack/react-query';

import { Chain } from '../../../model/chain';
import { useAssertWalletCore } from '../../../providers/WalletCoreProvider';
import { useCurrentVault } from '../../state/currentVault';
import { getVaultPublicKey } from '../getVaultPublicKey';

export const useVaultPublicKeyQuery = (chain: Chain) => {
  const walletCore = useAssertWalletCore();
  const vault = useCurrentVault();

  return useQuery({
    queryKey: ['vaultPublicKey'],
    queryFn: () =>
      getVaultPublicKey({
        chain,
        walletCore,
        vault,
      }),
  });
};
