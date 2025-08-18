import {
  PasscodeEncryptionStorage,
  PasscodeEncryptionValue,
} from '@core/ui/storage/passcodeEncryption'
import { initialPasscodeEncryptionValue } from '@core/ui/storage/passcodeEncryption'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'

export const passcodeEncryptionStorage: PasscodeEncryptionStorage = {
  getPasscodeEncryption: () =>
    getStorageValue(
      StorageKey.passcodeEncryption,
      initialPasscodeEncryptionValue
    ),
  setPasscodeEncryption: async (value: PasscodeEncryptionValue) => {
    await setStorageValue(StorageKey.passcodeEncryption, value)
  },
}
