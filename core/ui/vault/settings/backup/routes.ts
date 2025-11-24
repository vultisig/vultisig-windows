import { CoreView } from '../../../navigation/CoreView'
import type { BackupOptionType } from './options'

export const backupOptionView: Record<BackupOptionType, CoreView> = {
  device: { id: 'selectVaultsBackup' },
  server: { id: 'requestFastVaultBackup' },
}
