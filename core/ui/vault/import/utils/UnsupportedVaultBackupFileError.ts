const unsupportedVaultBackupFileMessage =
  "This file doesn't look like a Vultisig vault backup. Pick a `.vult` or `.vult.zip` file exported from the Vultisig app."

export class UnsupportedVaultBackupFileError extends Error {
  constructor() {
    super(unsupportedVaultBackupFileMessage)
    this.name = 'UnsupportedVaultBackupFileError'
  }
}

export const isUnsupportedVaultBackupFileError = (
  error: unknown
): error is UnsupportedVaultBackupFileError =>
  error instanceof UnsupportedVaultBackupFileError
