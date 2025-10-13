import { create, toBinary } from '@bufbuild/protobuf'
import { productName } from '@core/config'
import { getSevenZip } from '@core/mpc/compression/getSevenZip'
import { toCommVault } from '@core/mpc/types/utils/commVault'
import { VaultContainerSchema } from '@core/mpc/types/vultisig/vault/v1/vault_container_pb'
import { VaultSchema } from '@core/mpc/types/vultisig/vault/v1/vault_pb'
import { useUpdateVaultMutation } from '@core/ui/vault/mutations/useUpdateVaultMutation'
import { getVaultId, Vault } from '@core/ui/vault/Vault'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { attempt } from '@lib/utils/attempt'
import { encryptWithAesGcm } from '@lib/utils/encryption/aesGcm/encryptWithAesGcm'
import { match } from '@lib/utils/match'
import { useMutation } from '@tanstack/react-query'

import { decryptVaultKeyShares } from '../../passcodeEncryption/core/vaultKeyShares'
import { usePasscode } from '../../passcodeEncryption/state/passcode'
import { useCore } from '../../state/core'
import { useVaults } from '../../storage/vaults'

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
  vaultIds,
}: {
  onSuccess?: () => void
  vaultIds: string[]
}) => {
  const { mutateAsync: updateVault } = useUpdateVaultMutation()

  const { saveFile } = useCore()

  const vaults = useVaults()

  const [passcode] = usePasscode()

  return useMutation({
    mutationFn: async ({ password }: { password?: string }) => {
      const getVault = (id: string) => {
        const vault = shouldBePresent(
          vaults.find(vault => getVaultId(vault) === id),
          `Vault with id ${id}`
        )

        if (!passcode) {
          return vault
        }

        return {
          ...vault,
          keyShares: decryptVaultKeyShares({
            keyShares: vault.keyShares,
            key: passcode,
          }),
        }
      }

      const getFile = async () => {
        if (vaultIds.length === 1) {
          const [vaultId] = vaultIds
          const vault = getVault(vaultId)
          const base64Data = createBackup(vault, password)

          const blob = new Blob([base64Data], {
            type: 'application/octet-stream',
          })

          return {
            name: getExportName(vault),
            blob,
          }
        }

        const sevenZip = await getSevenZip()
        const fileNames: string[] = []
        const archiveName = `${[
          productName.toLowerCase(),
          'backups',
          Math.floor(Date.now() / 1000),
        ].join('_')}.zip`

        try {
          vaultIds.forEach(vaultId => {
            const vault = getVault(vaultId)
            const base64 = createBackup(vault, password)
            const name = getExportName(vault)
            sevenZip.FS.writeFile(name, base64)
            fileNames.push(name)
          })

          sevenZip.callMain(['a', archiveName, ...fileNames])
          const archiveBytes = sevenZip.FS.readFile(archiveName)
          const { buffer } = new Uint8Array(archiveBytes)
          const blob = new Blob([buffer], { type: 'application/zip' })

          return { name: archiveName, blob }
        } finally {
          attempt(() => {
            fileNames.forEach(fileName => {
              sevenZip.FS.unlink(fileName)
            })
            sevenZip.FS.unlink(archiveName)
          })
        }
      }

      const file = await getFile()
      await saveFile(file)

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
