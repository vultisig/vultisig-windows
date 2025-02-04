import { create, toBinary } from '@bufbuild/protobuf';
import { VaultContainerSchema } from '@core/communication/vultisig/vault/v1/vault_container_pb';
import {
  Vault,
  VaultSchema,
} from '@core/communication/vultisig/vault/v1/vault_pb';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { SaveFileBkp } from '../../../wailsjs/go/main/App';
import { storage } from '../../../wailsjs/go/models';
import { UpdateVaultIsBackedUp } from '../../../wailsjs/go/storage/Store';
import { encryptVault } from '../encryption/encryptVault';
import { vaultsQueryKey } from '../queries/useVaultsQuery';
import { fromStorageVault, getStorageVaultId } from '../utils/storageVault';

const getExportName = (vault: storage.Vault) => {
  const totalSigners = vault.signers.length;

  const localPartyIndex = vault.signers.indexOf(vault.local_party_id) + 1;

  return `${vault.name}-${vault.local_party_id}-part${localPartyIndex}of${totalSigners}.vult`;
};

const createBackup = async (vault: Vault, password: string) => {
  const vaultData = toBinary(VaultSchema, vault);

  const vaultContainer = create(VaultContainerSchema, {
    version: BigInt(1),
    vault: Buffer.from(vaultData).toString('base64'),
  });

  if (password) {
    vaultContainer.isEncrypted = true;
    const encryptedVault = encryptVault({
      password,
      vault: Buffer.from(vaultData),
    });
    vaultContainer.vault = encryptedVault.toString('base64');
  } else {
    vaultContainer.isEncrypted = false;
  }

  const vaultContainerData = toBinary(VaultContainerSchema, vaultContainer);

  return Buffer.from(vaultContainerData).toString('base64');
};

export const useBackupVaultMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      vault,
      password,
    }: {
      vault: storage.Vault;
      password: string;
    }) => {
      const base64Data = await createBackup(fromStorageVault(vault), password);
      await SaveFileBkp(getExportName(vault), base64Data);

      await UpdateVaultIsBackedUp(getStorageVaultId(vault), true);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [vaultsQueryKey],
      });
    },
  });
};
