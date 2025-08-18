import {
  PasscodeAutoLockStorage,
  PasscodeAutoLockValue,
} from '@core/ui/storage/passcodeAutoLock'
import { initialPasscodeAutoLockValue } from '@core/ui/storage/passcodeAutoLock'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'

export const passcodeAutoLockStorage: PasscodeAutoLockStorage = {
  getPasscodeAutoLock: () =>
    getStorageValue(StorageKey.passcodeAutoLock, initialPasscodeAutoLockValue),
  setPasscodeAutoLock: async (value: PasscodeAutoLockValue) => {
    await setStorageValue(StorageKey.passcodeAutoLock, value)
  },
}
