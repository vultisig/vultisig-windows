import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'

export const { provider: PasscodeProvider, useState: usePasscode } =
  getStateProviderSetup<string | null>('passcode')
