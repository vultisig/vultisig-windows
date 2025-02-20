import { getLastItem } from '@lib/utils/array/getLastItem'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

export const vaultBackupExtensions = ['bak', 'vult']

export type VaultBackupExtension = (typeof vaultBackupExtensions)[number]

export const getVaultBackupExtension = (fileName: string) => {
  const extension = isOneOf(
    getLastItem(fileName.split('.')),
    vaultBackupExtensions
  )

  return shouldBePresent(extension)
}
