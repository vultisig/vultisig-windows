import { setupStateProvider } from '@lib/ui/state/setupStateProvider'

export const [PasscodeProvider, usePasscode] = setupStateProvider<
  string | null
>('passcode')
