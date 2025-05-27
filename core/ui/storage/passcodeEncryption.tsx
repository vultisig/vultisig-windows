type PasscodeEncryption = {
  sample: string
  encryptedSample: string
}

type PasscodeEncryptionValue = PasscodeEncryption | null

export const initialPasscodeEncryptionValue: PasscodeEncryptionValue = null

export type PasscodeEncryptionStorage = {
  passcodeEncryption: PasscodeEncryptionValue
  setPasscodeEncryption: (passcodeEncryption: PasscodeEncryptionValue) => void
}
