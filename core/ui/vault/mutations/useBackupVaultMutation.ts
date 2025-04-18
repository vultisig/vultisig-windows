import { create, toBinary } from '@bufbuild/protobuf'
import { toCommVault } from '@core/mpc/types/utils/commVault'
import { VaultContainerSchema } from '@core/mpc/types/vultisig/vault/v1/vault_container_pb'
import { VaultSchema } from '@core/mpc/types/vultisig/vault/v1/vault_pb'
import { useUpdateVaultMutation } from '@core/ui/vault/mutations/useUpdateVaultMutation'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { getVaultId, Vault } from '@core/ui/vault/Vault'
import { encryptWithAesGcm } from '@lib/utils/encryption/aesGcm/encryptWithAesGcm'
import { match } from '@lib/utils/match'
import { useMutation } from '@tanstack/react-query'

import { useSaveFile } from '../../state/saveFile'

const getExportName = (vault: Vault) => {
  const totalSigners = vault.signers.length
  const localPartyIndex = vault.signers.indexOf(vault.localPartyId) + 1
  return match(vault.libType, {
    GG20: () => {
      return `${vault.name}-${vault.localPartyId}-part${localPartyIndex}of${totalSigners}.vult`
    },
    DKLS: () => {
      return `${vault.name}-${vault.localPartyId}-share${localPartyIndex}of${totalSigners}.vult`
    },
  })
}

const createBackup = async (vault: Vault, password?: string) => {
  const commVault = toCommVault(vault)
  const vaultData = toBinary(VaultSchema, commVault)

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

export const useBackupVaultMutation = ({
  onSuccess,
}: {
  onSuccess?: () => void
} = {}) => {
  const vault = useCurrentVault()

  const { mutateAsync: updateVault } = useUpdateVaultMutation()

  const saveFile = useSaveFile()

  return useMutation({
    mutationFn: async ({ password }: { password?: string }) => {
      const base64Data = await createBackup(vault, password)

      const blob = new Blob([base64Data], { type: 'application/octet-stream' })

      await saveFile({
        name: getExportName(vault),
        blob,
      })

      await updateVault({
        vaultId: getVaultId(vault),
        fields: { isBackedUp: true },
      })
    },
    onSuccess,
  })
}
