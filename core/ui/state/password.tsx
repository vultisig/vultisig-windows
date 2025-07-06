import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'

export const { useState: usePassword, provider: PasswordProvider } =
  getStateProviderSetup<string>('Password')
