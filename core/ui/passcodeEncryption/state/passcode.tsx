import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'

export const { provider: PasscodeProvider, useState: usePasscode } =
  getStateProviderSetup<string | null>('passcode')

export const useAssertPasscode = () => {
  const [passcode] = usePasscode()

  return shouldBePresent(passcode, 'passcode')
}
