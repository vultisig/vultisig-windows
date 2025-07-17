import {
  PasscodeAutoLockStorage,
  PasscodeAutoLockValue,
} from '@core/ui/storage/passcodeAutoLock'
import { initialPasscodeAutoLockValue } from '@core/ui/storage/passcodeAutoLock'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { getPersistentState } from '@lib/ui/state/persistent/getPersistentState'
import { setPersistentState } from '@lib/ui/state/persistent/setPersistentState'

export const passcodeAutoLockStorage: PasscodeAutoLockStorage = {
  getPasscodeAutoLock: () =>
    getPersistentState(
      StorageKey.passcodeAutoLock,
      initialPasscodeAutoLockValue
    ),
  setPasscodeAutoLock: async (value: PasscodeAutoLockValue) => {
    await setPersistentState(StorageKey.passcodeAutoLock, value)
  },
}
