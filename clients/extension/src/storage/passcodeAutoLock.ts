import { getPersistentState } from '@core/extension/state/persistent/getPersistentState'
import { setPersistentState } from '@core/extension/state/persistent/setPersistentState'
import {
  PasscodeAutoLockStorage,
  PasscodeAutoLockValue,
} from '@core/ui/storage/passcodeAutoLock'
import { initialPasscodeAutoLockValue } from '@core/ui/storage/passcodeAutoLock'
import { StorageKey } from '@core/ui/storage/StorageKey'

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
