import {
  PasscodeEncryptionStorage,
  PasscodeEncryptionValue,
} from '@core/ui/storage/passcodeEncryption'
import { initialPasscodeEncryptionValue } from '@core/ui/storage/passcodeEncryption'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { getPersistentState } from '@lib/ui/state/persistent/getPersistentState'
import { setPersistentState } from '@lib/ui/state/persistent/setPersistentState'

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
