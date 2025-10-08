import { create, toBinary } from '@bufbuild/protobuf'
import { getSevenZip } from '@core/mpc/compression/getSevenZip'
import { toCommVault } from '@core/mpc/types/utils/commVault'
import { VaultContainerSchema } from '@core/mpc/types/vultisig/vault/v1/vault_container_pb'
import { VaultSchema } from '@core/mpc/types/vultisig/vault/v1/vault_pb'
import { useUpdateVaultMutation } from '@core/ui/vault/mutations/useUpdateVaultMutation'
import { getVaultId, Vault } from '@core/ui/vault/Vault'
import { attempt } from '@lib/utils/attempt'
import { encryptWithAesGcm } from '@lib/utils/encryption/aesGcm/encryptWithAesGcm'
import { match } from '@lib/utils/match'
import { useMutation } from '@tanstack/react-query'

import { useCore } from '../../state/core'

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

const createBackup = (vault: Vault, password?: string) => {
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
  vaults,
}: {
  onSuccess?: () => void
  vaults: Vault[]
}) => {
  const { mutateAsync: updateVault } = useUpdateVaultMutation()

  const { saveFile } = useCore()

  return useMutation({
    mutationFn: async ({ password }: { password?: string }) => {
      if (vaults.length === 1) {
        const [vault] = vaults
        const base64Data = await createBackup(vault, password)

        const blob = new Blob([base64Data], {
          type: 'application/octet-stream',
        })

        await saveFile({
          name: getExportName(vault),
          blob,
        })
      } else {
        const sevenZip = await getSevenZip()
        const fileNames: string[] = []
        const archiveName = 'vultisig-vaults-backup.zip'

        try {
          vaults.forEach(vault => {
            const base64 = createBackup(vault, password)
            const bytes = Buffer.from(base64, 'base64')
            const name = getExportName(vault)
            sevenZip.FS.writeFile(name, bytes)
            fileNames.push(name)
          })

          sevenZip.callMain(['a', archiveName, ...fileNames])
          const archiveBytes = sevenZip.FS.readFile(archiveName)
          const arrayBuffer = new Uint8Array(archiveBytes).buffer as ArrayBuffer
          const blob = new Blob([arrayBuffer], { type: 'application/zip' })
          await saveFile({ name: archiveName, blob })
        } finally {
          attempt(() => {
            fileNames.forEach(fileName => {
              sevenZip.FS.unlink(fileName)
            })
            sevenZip.FS.unlink(archiveName)
          })
        }
      }

      await Promise.all(
        vaults.map(vault =>
          updateVault({
            vaultId: getVaultId(vault),
            fields: { isBackedUp: true },
          })
        )
      )
    },
    onSuccess,
  })
}
