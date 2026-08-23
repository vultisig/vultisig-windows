import { setupStateProvider } from '@lib/ui/state/setupStateProvider'

/**
 * Count of mounted `PasscodeAutoLockHold`s. While it is above zero the
 * inactivity auto-lock defers clearing the passcode instead of firing.
 */
export const [PasscodeAutoLockHoldsProvider, usePasscodeAutoLockHolds] =
  setupStateProvider<number>('passcodeAutoLockHolds', 0)
