import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'

export const {
  useState: useVaultPasswordHint,
  provider: PasswordHintProvider,
} = getStateProviderSetup<string>('PasswordHint')
