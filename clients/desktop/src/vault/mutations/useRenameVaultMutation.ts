import { useMutation } from '@tanstack/react-query';

import { storage } from '../../../wailsjs/go/models';
import { Vault } from '@core/communication/vultisig/vault/v1/vault_pb';
import { VaultService } from '../../services/Vault/VaultService';

export const useRenameVaultMutation = () => {
  const vaultService = new VaultService();

  return useMutation({
    mutationFn: async ({
      vault,
      newName,
    }: {
      vault: storage.Vault | Vault;
      newName: string;
    }) => {
      await vaultService.renameVault(vault, newName);
    },
  });
};
