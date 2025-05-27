type PasscodeEncryption = {
  sample: string
  encryptedSample: string
}

export type PasscodeEncryptionValue = PasscodeEncryption | null

export const initialPasscodeEncryptionValue: PasscodeEncryptionValue = null

export type PasscodeEncryptionStorage = {
  getPasscodeEncryption: () => Promise<PasscodeEncryptionValue>
  setPasscodeEncryption: (value: PasscodeEncryptionValue) => Promise<void>
}
