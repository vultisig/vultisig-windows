import {
  initialPasscodeEncryptionValue,
  PasscodeEncryptionStorage,
  PasscodeEncryptionValue,
} from '@core/ui/storage/passcodeEncryption'
import { StorageKey } from '@core/ui/storage/StorageKey'

import { persistentStorage } from '../state/persistentState'

export const passcodeEncryptionStorage: PasscodeEncryptionStorage = {
  getPasscodeEncryption: async () => {
    const value = persistentStorage.getItem<PasscodeEncryptionValue>(
      StorageKey.passcodeEncryption
    )

    if (value === undefined) {
      return initialPasscodeEncryptionValue
    }

    return value
  },
  setPasscodeEncryption: async (value: PasscodeEncryptionValue) => {
    persistentStorage.setItem(StorageKey.passcodeEncryption, value)
  },
}
