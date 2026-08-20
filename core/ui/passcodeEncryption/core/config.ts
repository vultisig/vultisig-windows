export const passcodeEncryptionConfig = {
  passcodeLength: 6,
  legacyPasscodeLength: 5,
  freeAttempts: 3,
  baseDelayMs: 5_000,
  maximumDelayMs: 15 * 60 * 1_000,
} as const
