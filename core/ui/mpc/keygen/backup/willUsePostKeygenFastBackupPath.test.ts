import { describe, expect, it } from 'vitest'

import { willUsePostKeygenFastBackupPath } from './willUsePostKeygenFastBackupPath'

describe('willUsePostKeygenFastBackupPath', () => {
  it('is true when a server signer is present and local party is not the server', () => {
    expect(
      willUsePostKeygenFastBackupPath({
        signers: ['Mac-6001', 'Server-6002'],
        localPartyId: 'Mac-6001',
      })
    ).toBe(true)
  })

  it('is false when a server signer is present and local party is the server', () => {
    expect(
      willUsePostKeygenFastBackupPath({
        signers: ['Mac-6001', 'Server-6002'],
        localPartyId: 'Server-6002',
      })
    ).toBe(false)
  })

  it('is false when no server signer is in the vault', () => {
    expect(
      willUsePostKeygenFastBackupPath({
        signers: ['Mac-6001', 'Mac-6002'],
        localPartyId: 'Mac-6001',
      })
    ).toBe(false)
  })
})
