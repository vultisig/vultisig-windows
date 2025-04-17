import { isLikelyToBeDklsVaultBackup } from '@core/ui/vault/import/utils/isLikelyToBeDklsVaultBackup'
import { vaultBackupResultFromFileContent } from '@core/ui/vault/import/utils/vaultBackupResultFromString'
import { getVaultBackupExtension } from '@core/ui/vault/import/VaultBackupExtension'
import { FileBasedVaultBackupResult } from '@core/ui/vault/import/VaultBackupResult'
import { readFileAsArrayBuffer } from '@lib/utils/file/readFileAsArrayBuffer'

export const vaultBackupResultFromFile = async (
  file: File
): Promise<FileBasedVaultBackupResult> => {
  const fileContent = await readFileAsArrayBuffer(file)

  const result = vaultBackupResultFromFileContent({
    value: fileContent,
    extension: getVaultBackupExtension(file.name),
  })

  if (
    isLikelyToBeDklsVaultBackup({
      size: file.size,
      fileName: file.name,
    })
  ) {
    return {
      result,
      override: { libType: 'DKLS' },
    }
  }

  return {
    result,
  }
}
