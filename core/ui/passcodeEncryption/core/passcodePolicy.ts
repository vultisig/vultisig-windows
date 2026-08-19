import { passcodeEncryptionConfig } from './config'

export const isWeakPasscode = (passcode: string): boolean => {
  if (new Set(passcode).size === 1) {
    return true
  }

  const digits = [...passcode].map(Number)
  const isSequential = (step: 1 | -1) =>
    digits.every(
      (digit, index) => index === 0 || digit === digits[index - 1] + step
    )

  return isSequential(1) || isSequential(-1)
}

export const isValidNewPasscode = (passcode: string): boolean =>
  /^\d+$/.test(passcode) &&
  passcode.length === passcodeEncryptionConfig.passcodeLength &&
  !isWeakPasscode(passcode)

export const assertValidNewPasscode = (passcode: string) => {
  if (!isValidNewPasscode(passcode)) {
    throw new Error(
      `Passcode must be ${passcodeEncryptionConfig.passcodeLength} non-repeated, non-sequential digits`
    )
  }
}

export const getStoredPasscodeLength = (length?: number): number =>
  length === undefined ||
  length === passcodeEncryptionConfig.legacyPasscodeLength
    ? passcodeEncryptionConfig.legacyPasscodeLength
    : passcodeEncryptionConfig.passcodeLength
