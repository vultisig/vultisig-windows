import { useMutation } from '@tanstack/react-query';

import { SaveFile } from '../../../wailsjs/go/main/App';
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
      const base64Data = await vaultService.createBackup(vault, password);
      await SaveFile('vault-backup.bak', base64Data);
    },
  });
};
