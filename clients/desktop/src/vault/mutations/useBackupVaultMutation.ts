import { create, toBinary } from '@bufbuild/protobuf'
import { VaultContainerSchema } from '@core/mpc/types/vultisig/vault/v1/vault_container_pb'
import { Vault, VaultSchema } from '@core/mpc/types/vultisig/vault/v1/vault_pb'
import { encryptWithAesGcm } from '@lib/utils/encryption/aesGcm/encryptWithAesGcm'
import { match } from '@lib/utils/match'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { SaveFileBkp } from '../../../wailsjs/go/main/App'
import { storage } from '../../../wailsjs/go/models'
import { UpdateVaultIsBackedUp } from '../../../wailsjs/go/storage/Store'
import { vaultsQueryKey } from '../queries/useVaultsQuery'
import { fromStorageVault, getStorageVaultId } from '../utils/storageVault'

const getExportName = (vault: storage.Vault) => {
  const totalSigners = vault.signers.length
  const localPartyIndex = vault.signers.indexOf(vault.local_party_id) + 1
  return match(vault.lib_type, {
    GG20: () => {
      return `${vault.name}-${vault.local_party_id}-part${localPartyIndex}of${totalSigners}.vult`
    },
    DKLS: () => {
      return `${vault.name}-${vault.local_party_id}-share${localPartyIndex}of${totalSigners}.vult`
    },
  })
}

const createBackup = async (vault: Vault, password: string) => {
  const vaultData = toBinary(VaultSchema, vault)

  const vaultContainer = create(VaultContainerSchema, {
    version: BigInt(1),
    vault: Buffer.from(vaultData).toString('base64'),
  })

  if (password) {
    vaultContainer.isEncrypted = true
    const encryptedVault = encryptWithAesGcm({
      key: password,
      value: Buffer.from(vaultData),
    })
    vaultContainer.vault = encryptedVault.toString('base64')
  } else {
    vaultContainer.isEncrypted = false
  }

  const vaultContainerData = toBinary(VaultContainerSchema, vaultContainer)

  return Buffer.from(vaultContainerData).toString('base64')
}

export const useBackupVaultMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      vault,
      password,
    }: {
      vault: storage.Vault
      password?: string
    }) => {
      const base64Data = await createBackup(
        fromStorageVault(vault),
        password as string
      )
      await SaveFileBkp(getExportName(vault), base64Data)
      await UpdateVaultIsBackedUp(getStorageVaultId(vault), true)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [vaultsQueryKey],
      })
    },
  })
}
