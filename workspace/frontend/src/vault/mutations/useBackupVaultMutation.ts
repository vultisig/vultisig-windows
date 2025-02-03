import { useMutation, useQueryClient } from '@tanstack/react-query';

import { storage } from '../../../wailsjs/go/models';
import { UpdateVaultIsBackedUp } from '../../../wailsjs/go/storage/Store';
import { VaultService } from '../../services/Vault/VaultService';
import { vaultsQueryKey } from '../queries/useVaultsQuery';
import { getStorageVaultId } from '../utils/storageVault';

export const useBackupVaultMutation = () => {
  const vaultService = new VaultService();
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
      await UpdateVaultIsBackedUp(getStorageVaultId(vault), true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [vaultsQueryKey],
      });
    },
  });
};
