import { useMutation, useQueryClient } from '@tanstack/react-query';

import { storage } from '../../../wailsjs/go/models';
import { useAssertWalletCore } from '../../providers/WalletCoreProvider';
import { VaultServiceFactory } from '../../services/Vault/VaultServiceFactory';
import { vaultsQueryKey } from '../queries/useVaultsQuery';

export const useBackupVaultMutation = () => {
  const walletCore = useAssertWalletCore();
  const vaultService = VaultServiceFactory.getService(walletCore);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      vault,
      password,
    }: {
      vault: storage.Vault;
      password: string;
    }) => {
      await vaultService.createAndSaveBackup(vault, password);
      await vaultService.saveVault({
        ...vault,
        is_backed_up: true,
      } as storage.Vault);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [vaultsQueryKey],
      });
    },
  });
};
