import type { PasscodeUnlockSessionStorage } from '@core/ui/storage/passcodeUnlockSession'

export const passcodeUnlockSessionStorage: PasscodeUnlockSessionStorage = {
  canPersistPasscodeUnlockSession: false,
  getPasscodeUnlockSession: async () => null,
  setPasscodeUnlockSession: async () => {},
  clearPasscodeUnlockSession: async () => {},
}
