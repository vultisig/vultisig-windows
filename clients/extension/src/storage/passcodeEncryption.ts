import { getPersistentState } from '@core/extension/state/persistent/getPersistentState'
import { setPersistentState } from '@core/extension/state/persistent/setPersistentState'
import {
  PasscodeEncryptionStorage,
  PasscodeEncryptionValue,
} from '@core/ui/storage/passcodeEncryption'
import { initialPasscodeEncryptionValue } from '@core/ui/storage/passcodeEncryption'
import { StorageKey } from '@core/ui/storage/StorageKey'

export const passcodeEncryptionStorage: PasscodeEncryptionStorage = {
  getPasscodeEncryption: () =>
    getPersistentState(
      StorageKey.passcodeEncryption,
      initialPasscodeEncryptionValue
    ),
  setPasscodeEncryption: async (value: PasscodeEncryptionValue) => {
    await setPersistentState(StorageKey.passcodeEncryption, value)
  },
}
