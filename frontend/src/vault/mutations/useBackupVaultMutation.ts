import { useMutation } from '@tanstack/react-query';

import { storage } from '../../../wailsjs/go/models';
import { useAssertWalletCore } from '../../providers/WalletCoreProvider';
import { VaultServiceFactory } from '../../services/Vault/VaultServiceFactory';

export const useBackupVaultMutation = () => {
  const walletCore = useAssertWalletCore();
  const vaultService = VaultServiceFactory.getService(walletCore);

  return useMutation({
    mutationFn: async ({
      vault,
      password,
    }: {
      vault: storage.Vault;
      password: string;
    }) => {
      await vaultService.createAndSaveBackup(vault, password);
    },
  });
};
