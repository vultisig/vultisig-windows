import { convertDuration } from '@vultisig/lib-utils/time/convertDuration'

import type { PasscodeAutoLockValue } from './passcodeAutoLock'

export type PasscodeUnlockSession = {
  passcode: string
  expiresAt: number | null
}

export type PasscodeUnlockSessionStorage = {
  canPersistPasscodeUnlockSession: boolean
  getPasscodeUnlockSession: () => Promise<PasscodeUnlockSession | null>
  setPasscodeUnlockSession: (value: PasscodeUnlockSession) => Promise<void>
  clearPasscodeUnlockSession: () => Promise<void>
}

export const computePasscodeUnlockSessionExpiresAt = (
  passcodeAutoLock: PasscodeAutoLockValue
): number | null => {
  if (passcodeAutoLock === null) {
    return null
  }

  return Date.now() + convertDuration(passcodeAutoLock, 'min', 'ms')
}
