import { setupStateProvider } from '@lib/ui/state/setupStateProvider'

export const [PasswordProvider, usePassword] =
  setupStateProvider<string>('Password')
