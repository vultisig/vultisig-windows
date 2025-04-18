import { fromDatBackupString } from '@core/ui/vault/import/utils/fromDatBackupString'
import { vaultContainerFromString } from '@core/ui/vault/import/utils/vaultContainerFromString'
import { VaultBackupExtension } from '@core/ui/vault/import/VaultBackupExtension'
import { VaultBackupResult } from '@core/ui/vault/import/VaultBackupResult'

type Input = {
  extension: VaultBackupExtension
  value: ArrayBuffer
}

export const vaultBackupResultFromFileContent = ({
  value,
  extension,
}: Input): VaultBackupResult => {
  const valueAsString = new TextDecoder().decode(value)

  if (extension === 'dat') {
    try {
      const vault = fromDatBackupString(valueAsString)

      return { vault }
    } catch {
      return { encryptedVault: value }
    }
  }

  return { vaultContainer: vaultContainerFromString(valueAsString) }
}
