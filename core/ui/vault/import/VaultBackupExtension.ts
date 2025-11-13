import { getLastItem } from '@lib/utils/array/getLastItem'
import { isOneOf } from '@lib/utils/array/isOneOf'

export const vaultBackupExtensions = ['bak', 'vult', 'dat'] as const

export const vaultBackupArchiveExtensions = ['zip'] as const

export type VaultBackupExtension = (typeof vaultBackupExtensions)[number]

export type VaultBackupArchiveExtension =
  (typeof vaultBackupArchiveExtensions)[number]

export const getFileExtension = (fileName: string) =>
  (getLastItem(fileName.split('.')) || '').toLowerCase()

export const getVaultBackupExtension = (fileName: string) => {
  const extension = getFileExtension(fileName)

  if (!isOneOf(extension, vaultBackupExtensions)) {
    throw new Error(`Invalid vault backup extension: ${extension}`)
  }

  return extension
}

export const isVaultBackupArchiveExtension = (
  extension: string
): extension is VaultBackupArchiveExtension =>
  isOneOf(extension, vaultBackupArchiveExtensions)

export const importableVaultBackupExtensions = [
  ...vaultBackupExtensions,
  ...vaultBackupArchiveExtensions,
] as const
