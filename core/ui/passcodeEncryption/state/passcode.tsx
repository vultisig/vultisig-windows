import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'

export const { provider: PasscodeProvider, useValue: usePasscode } =
  getValueProviderSetup<string>('passcode')
