import { describe, expect, it } from 'vitest'

import { passcodeUnlockSessionStorage } from './passcodeUnlockSession'

describe('passcodeUnlockSessionStorage (desktop no-op)', () => {
  it('cannot persist unlock session', () => {
    expect(passcodeUnlockSessionStorage.canPersistPasscodeUnlockSession).toBe(
      false
    )
  })

  it('get returns null', async () => {
    await expect(
      passcodeUnlockSessionStorage.getPasscodeUnlockSession()
    ).resolves.toBeNull()
  })

  it('set and clear resolve without throwing', async () => {
    await expect(
      passcodeUnlockSessionStorage.setPasscodeUnlockSession({
        passcode: 'x',
        expiresAt: null,
      })
    ).resolves.toBeUndefined()

    await expect(
      passcodeUnlockSessionStorage.clearPasscodeUnlockSession()
    ).resolves.toBeUndefined()
  })
})
