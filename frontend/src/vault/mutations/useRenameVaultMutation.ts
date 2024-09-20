import { useMutation } from '@tanstack/react-query';

import { storage } from '../../../wailsjs/go/models';
import { Vault } from '../../gen/vultisig/vault/v1/vault_pb';
import { useAssertWalletCore } from '../../providers/WalletCoreProvider';
import { VaultServiceFactory } from '../../services/Vault/VaultServiceFactory';

export const useRenameVaultMutation = () => {
  const walletCore = useAssertWalletCore();
  const vaultService = VaultServiceFactory.getService(walletCore);

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
