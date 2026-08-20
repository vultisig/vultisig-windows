import {
  passcodeUnlockSessionChromeStorageKey,
  passcodeUnlockSessionStorage,
} from '@core/extension/storage/passcodeUnlockSession'
import { sealPasscode } from '@core/extension/storage/passcodeUnlockSessionCipher'
import { computePasscodeUnlockSessionExpiresAt } from '@core/ui/storage/passcodeUnlockSession'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { chromeMock } from './mocks/chrome'

const storeSealedSession = async (
  passcode: string,
  expiresAt: number | null
) => {
  const { iv, sealedPasscode } = await sealPasscode(passcode)

  await chrome.storage.session.set({
    [passcodeUnlockSessionChromeStorageKey]: {
      v: 2,
      iv,
      sealedPasscode,
      expiresAt,
    },
  })
}

const readStoredPayload = async () => {
  const stored = await chrome.storage.session.get(
    passcodeUnlockSessionChromeStorageKey
  )

  return stored[passcodeUnlockSessionChromeStorageKey]
}

describe('passcodeUnlockSessionStorage (extension)', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('restores a valid passcode before expiry', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))

    await passcodeUnlockSessionStorage.setPasscodeUnlockSession({
      passcode: 'unlock-secret',
      expiresAt: computePasscodeUnlockSessionExpiresAt(15),
    })

    vi.setSystemTime(new Date('2026-01-01T00:14:00Z'))

    await expect(
      passcodeUnlockSessionStorage.getPasscodeUnlockSession()
    ).resolves.toEqual({
      passcode: 'unlock-secret',
      expiresAt: expect.any(Number),
    })
  })

  it('returns null and clears storage when session is expired', async () => {
    await storeSealedSession('stale', Date.now() - 60_000)

    await expect(
      passcodeUnlockSessionStorage.getPasscodeUnlockSession()
    ).resolves.toBeNull()

    await expect(readStoredPayload()).resolves.toBeUndefined()
  })

  it('refreshes TTL on subsequent writes', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-01T12:00:00Z'))

    await passcodeUnlockSessionStorage.setPasscodeUnlockSession({
      passcode: 'x',
      expiresAt: computePasscodeUnlockSessionExpiresAt(15),
    })

    vi.setSystemTime(new Date('2026-06-01T12:10:00Z'))

    await passcodeUnlockSessionStorage.setPasscodeUnlockSession({
      passcode: 'x',
      expiresAt: computePasscodeUnlockSessionExpiresAt(15),
    })

    vi.setSystemTime(new Date('2026-06-01T12:20:00Z'))

    await expect(
      passcodeUnlockSessionStorage.getPasscodeUnlockSession()
    ).resolves.toEqual({ passcode: 'x', expiresAt: expect.any(Number) })

    vi.setSystemTime(new Date('2026-06-01T12:26:00Z'))

    await expect(
      passcodeUnlockSessionStorage.getPasscodeUnlockSession()
    ).resolves.toBeNull()
  })

  it('clears session on explicit clear', async () => {
    await passcodeUnlockSessionStorage.setPasscodeUnlockSession({
      passcode: 'gone',
      expiresAt: computePasscodeUnlockSessionExpiresAt(5),
    })

    await passcodeUnlockSessionStorage.clearPasscodeUnlockSession()

    await expect(
      passcodeUnlockSessionStorage.getPasscodeUnlockSession()
    ).resolves.toBeNull()
  })

  it('persists for the browser session when auto-lock is disabled', async () => {
    await passcodeUnlockSessionStorage.setPasscodeUnlockSession({
      passcode: 'session-only',
      expiresAt: computePasscodeUnlockSessionExpiresAt(null),
    })

    await expect(
      passcodeUnlockSessionStorage.getPasscodeUnlockSession()
    ).resolves.toEqual({ passcode: 'session-only', expiresAt: null })
  })

  it('never writes the passcode in the clear', async () => {
    await passcodeUnlockSessionStorage.setPasscodeUnlockSession({
      passcode: 'plaintext-passcode',
      expiresAt: computePasscodeUnlockSessionExpiresAt(null),
    })

    const payload = await readStoredPayload()

    expect(JSON.stringify(payload)).not.toContain('plaintext-passcode')
    expect(payload).not.toHaveProperty('passcode')
  })

  it('seals repeated writes of one passcode under different nonces', async () => {
    await passcodeUnlockSessionStorage.setPasscodeUnlockSession({
      passcode: 'same',
      expiresAt: null,
    })
    const first = await readStoredPayload()

    await passcodeUnlockSessionStorage.setPasscodeUnlockSession({
      passcode: 'same',
      expiresAt: null,
    })
    const second = await readStoredPayload()

    expect(first).not.toEqual(second)
  })

  it('falls back to locked state when session storage read fails', async () => {
    chromeMock.storage.session.get.mockRejectedValueOnce(new Error('boom'))

    await expect(
      passcodeUnlockSessionStorage.getPasscodeUnlockSession()
    ).resolves.toBeNull()
  })

  it('rejects and discards a plaintext v1 record', async () => {
    await chrome.storage.session.set({
      [passcodeUnlockSessionChromeStorageKey]: {
        v: 1,
        passcode: 'legacy-plaintext',
        expiresAt: null,
      },
    })

    await expect(
      passcodeUnlockSessionStorage.getPasscodeUnlockSession()
    ).resolves.toBeNull()

    await expect(readStoredPayload()).resolves.toBeUndefined()
  })

  it.each([
    ['unknown schema version', { v: 3, iv: 'a', sealedPasscode: 'b', expiresAt: null }],
    ['missing iv', { v: 2, sealedPasscode: 'b', expiresAt: null }],
    ['missing sealedPasscode', { v: 2, iv: 'a', expiresAt: null }],
    ['missing expiresAt key', { v: 2, iv: 'a', sealedPasscode: 'b' }],
    [
      'expiresAt is NaN',
      { v: 2, iv: 'a', sealedPasscode: 'b', expiresAt: Number.NaN },
    ],
    [
      'expiresAt is non-number',
      { v: 2, iv: 'a', sealedPasscode: 'b', expiresAt: 'nope' },
    ],
  ])('returns null for corrupt payload: %s', async (_label, payload) => {
    await chrome.storage.session.set({
      [passcodeUnlockSessionChromeStorageKey]: payload,
    })

    await expect(
      passcodeUnlockSessionStorage.getPasscodeUnlockSession()
    ).resolves.toBeNull()
  })

  it('returns null when the sealed passcode cannot be opened', async () => {
    const { iv } = await sealPasscode('x')

    await chrome.storage.session.set({
      [passcodeUnlockSessionChromeStorageKey]: {
        v: 2,
        iv,
        sealedPasscode: 'dGFtcGVyZWQtY2lwaGVydGV4dA==',
        expiresAt: null,
      },
    })

    await expect(
      passcodeUnlockSessionStorage.getPasscodeUnlockSession()
    ).resolves.toBeNull()
  })

  it('does not throw when session set rejects', async () => {
    chromeMock.storage.session.set.mockRejectedValueOnce(new Error('set failed'))

    await expect(
      passcodeUnlockSessionStorage.setPasscodeUnlockSession({
        passcode: 'x',
        expiresAt: null,
      })
    ).resolves.toBeUndefined()
  })

  it('does not throw when session remove rejects', async () => {
    chromeMock.storage.session.remove.mockRejectedValueOnce(
      new Error('remove failed')
    )

    await expect(
      passcodeUnlockSessionStorage.clearPasscodeUnlockSession()
    ).resolves.toBeUndefined()
  })

  it('does not write unlock session to chrome.storage.local', async () => {
    await passcodeUnlockSessionStorage.setPasscodeUnlockSession({
      passcode: 'secret',
      expiresAt: computePasscodeUnlockSessionExpiresAt(5),
    })

    expect(chromeMock.storage.local.set).not.toHaveBeenCalled()
    const local = await chrome.storage.local.get(
      passcodeUnlockSessionChromeStorageKey
    )
    expect(local[passcodeUnlockSessionChromeStorageKey]).toBeUndefined()
  })

  it('treats expiresAt equal to Date.now() as still valid', async () => {
    vi.useFakeTimers()
    const now = new Date('2026-03-01T12:00:00.000Z')
    vi.setSystemTime(now)

    await storeSealedSession('edge', now.getTime())

    await expect(
      passcodeUnlockSessionStorage.getPasscodeUnlockSession()
    ).resolves.toEqual({
      passcode: 'edge',
      expiresAt: now.getTime(),
    })
  })
})
