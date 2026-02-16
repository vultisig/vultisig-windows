import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'

type FocusedBackupField = 'email' | 'password' | null

type FocusedBackupFieldContext = {
  field: FocusedBackupField
}

export const {
  useState: useBackupFormFieldState,
  provider: BackupFormFieldsStateProvider,
} = getStateProviderSetup<FocusedBackupFieldContext>(
  'BackupFormFieldStateProvider'
)
