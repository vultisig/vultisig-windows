import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'

export const { useState: usePasswordHint, provider: PasswordHintProvider } =
  getStateProviderSetup<string>('PasswordHint')
