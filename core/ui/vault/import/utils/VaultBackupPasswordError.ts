export class VaultBackupPasswordError extends Error {
  constructor() {
    super('Incorrect password')
    this.name = 'VaultBackupPasswordError'
  }
}
