import { create, toBinary } from '@bufbuild/protobuf'
import { toCommVault } from '@core/mpc/types/utils/commVault'
import { VaultContainerSchema } from '@core/mpc/types/vultisig/vault/v1/vault_container_pb'
import { VaultSchema } from '@core/mpc/types/vultisig/vault/v1/vault_pb'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useVaults } from '@core/ui/vault/state/vaults'
import { getVaultId, Vault } from '@core/ui/vault/Vault'
import { encryptWithAesGcm } from '@lib/utils/encryption/aesGcm/encryptWithAesGcm'
import { match } from '@lib/utils/match'
import { useMutation } from '@tanstack/react-query'

import { useVaultsMutation } from '../../vault/state/vaults'

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
  const vaults = useVaults()
  const { mutateAsync: updateVaults } = useVaultsMutation()

  return useMutation({
    mutationFn: async ({ password }: { password?: string }) => {
      const base64Data = await createBackup(vault, password)
      const fileName = getExportName(vault)
      const blob = new Blob([base64Data], { type: 'application/octet-stream' })
      const url = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      // TODO: revise this - it's not going to work at the moment
      await updateVaults(
        vaults.map(currentVault =>
          getVaultId(currentVault) === getVaultId(vault)
            ? { ...vault, isBackedUp: true }
            : currentVault
        )
      )
    },
    onSuccess,
  })
}
