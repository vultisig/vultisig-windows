import { setupStateProvider } from '@lib/ui/state/setupStateProvider'

type FocusedBackupField = 'email' | 'password' | null

type FocusedBackupFieldContext = {
  field: FocusedBackupField
}

export const [BackupFormFieldsStateProvider, useBackupFormFieldState] =
  setupStateProvider<FocusedBackupFieldContext>('BackupFormFieldStateProvider')
