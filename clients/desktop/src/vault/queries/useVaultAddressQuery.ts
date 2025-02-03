import { deriveAddress } from '../../chain/utils/deriveAddress';
import { useStateDependentQuery } from '../../lib/ui/query/hooks/useStateDependentQuery';
import { Chain } from '../../model/chain';
import { useAssertWalletCore } from '../../providers/WalletCoreProvider';
import { useVaultPublicKeyQuery } from '../publicKey/queries/useVaultPublicKeyQuery';
import { useCurrentVaultId } from '../state/currentVaultId';

export const useVaultAddressQuery = (chain: Chain) => {
  const vaultId = useCurrentVaultId();

  const walletCore = useAssertWalletCore();

  const publicKeyQuery = useVaultPublicKeyQuery(chain);

  return useStateDependentQuery({
    state: {
      publicKey: publicKeyQuery.data,
    },
    getQuery: ({ publicKey }) => ({
      queryKey: ['vaultChainAddress', vaultId, chain],
      queryFn: async () => {
        return deriveAddress({ chain, publicKey, walletCore });
      },
    }),
  });
};
