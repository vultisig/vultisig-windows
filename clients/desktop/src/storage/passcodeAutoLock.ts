import {
  initialPasscodeAutoLockValue,
  PasscodeAutoLockStorage,
  PasscodeAutoLockValue,
} from '@core/ui/storage/passcodeAutoLock'
import { StorageKey } from '@core/ui/storage/StorageKey'

import { persistentStorage } from '../state/persistentState'

export const passcodeAutoLockStorage: PasscodeAutoLockStorage = {
  getPasscodeAutoLock: async () => {
    const value = persistentStorage.getItem<PasscodeAutoLockValue>(
      StorageKey.passcodeAutoLock
    )

    if (value === undefined) {
      return initialPasscodeAutoLockValue
    }

    return value
  },
  setPasscodeAutoLock: async (value: PasscodeAutoLockValue) => {
    persistentStorage.setItem(StorageKey.passcodeAutoLock, value)
  },
}
