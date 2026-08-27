// @vitest-environment happy-dom

import { usePasscodeUnlockSession } from '@core/ui/passcodeEncryption/autoLock/usePasscodeUnlockSession'
import { verifyPasscode } from '@core/ui/passcodeEncryption/core/passcodeLock'
import { usePasscode } from '@core/ui/passcodeEncryption/state/passcode'
import { useCore } from '@core/ui/state/core'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@core/ui/state/core', () => ({
  useCore: vi.fn(),
}))

vi.mock('@core/ui/passcodeEncryption/state/passcode', () => ({
  usePasscode: vi.fn(),
}))

vi.mock('@core/ui/passcodeEncryption/core/passcodeLock', () => ({
  verifyPasscode: vi.fn(),
}))

describe('usePasscodeUnlockSession', () => {
  beforeEach(() => {
    vi.mocked(useCore).mockReset()
    vi.mocked(usePasscode).mockReset()
    vi.mocked(verifyPasscode).mockReset()
  })

  it('when persistence is disabled: no pending restore and no storage calls', () => {
    const getPasscodeUnlockSession = vi.fn()
    const setPasscodeUnlockSession = vi.fn()
    const clearPasscodeUnlockSession = vi.fn()

    vi.mocked(useCore).mockReturnValue({
      canPersistPasscodeUnlockSession: false,
      getPasscodeUnlockSession,
      setPasscodeUnlockSession,
      clearPasscodeUnlockSession,
    } as ReturnType<typeof useCore>)

    vi.mocked(usePasscode).mockReturnValue([null, vi.fn()])

    const { result } = renderHook(() =>
      usePasscodeUnlockSession({
        hasPasscodeEncryption: true,
        passcodeAutoLock: 15,
      })
    )

    expect(result.current.pendingPasscodeUnlockRestore).toBe(false)
    expect(result.current.restoreComplete).toBe(true)
    expect(getPasscodeUnlockSession).not.toHaveBeenCalled()
    expect(setPasscodeUnlockSession).not.toHaveBeenCalled()
    expect(clearPasscodeUnlockSession).not.toHaveBeenCalled()
  })

  it('while restore is pending: no set/clear; after null restore: clears storage', async () => {
    let resolveGet!: (
      value: { passcode: string; expiresAt: number | null } | null
    ) => void
    const restorePromise = new Promise<{
      passcode: string
      expiresAt: number | null
    } | null>(resolve => {
      resolveGet = resolve
    })

    const getPasscodeUnlockSession = vi.fn(() => restorePromise)
    const setPasscodeUnlockSession = vi.fn(async () => {})
    const clearPasscodeUnlockSession = vi.fn(async () => {})

    vi.mocked(useCore).mockReturnValue({
      canPersistPasscodeUnlockSession: true,
      getPasscodeUnlockSession,
      setPasscodeUnlockSession,
      clearPasscodeUnlockSession,
    } as ReturnType<typeof useCore>)

    const setPasscode = vi.fn()
    vi.mocked(usePasscode).mockReturnValue([null, setPasscode])

    const { result } = renderHook(() =>
      usePasscodeUnlockSession({
        hasPasscodeEncryption: true,
        passcodeAutoLock: null,
      })
    )

    await waitFor(() => {
      expect(result.current.pendingPasscodeUnlockRestore).toBe(true)
    })

    expect(setPasscodeUnlockSession).not.toHaveBeenCalled()
    expect(clearPasscodeUnlockSession).not.toHaveBeenCalled()

    resolveGet(null)

    await waitFor(() => {
      expect(result.current.pendingPasscodeUnlockRestore).toBe(false)
      expect(result.current.restoreComplete).toBe(true)
    })

    await waitFor(() => {
      expect(clearPasscodeUnlockSession).toHaveBeenCalled()
    })

    expect(setPasscode).not.toHaveBeenCalled()
    expect(setPasscodeUnlockSession).not.toHaveBeenCalled()
  })

  it('after a valid session restore: applies stored passcode', async () => {
    const getPasscodeUnlockSession = vi.fn(async () => ({
      passcode: 'from-session',
      expiresAt: null as number | null,
    }))
    const setPasscodeUnlockSession = vi.fn(async () => {})
    const clearPasscodeUnlockSession = vi.fn(async () => {})
    const getPasscodeEncryption = vi.fn(async () => ({
      encryptedSample: 'current-proof',
    }))
    const getVaults = vi.fn(async () => [])

    vi.mocked(useCore).mockReturnValue({
      canPersistPasscodeUnlockSession: true,
      getPasscodeUnlockSession,
      setPasscodeUnlockSession,
      clearPasscodeUnlockSession,
      getPasscodeEncryption,
      getVaults,
    } as ReturnType<typeof useCore>)
    vi.mocked(verifyPasscode).mockResolvedValue(true)

    const setPasscode = vi.fn()
    vi.mocked(usePasscode).mockReturnValue([null, setPasscode])

    const { result } = renderHook(() =>
      usePasscodeUnlockSession({
        hasPasscodeEncryption: true,
        passcodeAutoLock: null,
      })
    )

    await waitFor(() => {
      expect(result.current.restoreComplete).toBe(true)
    })

    expect(setPasscode).toHaveBeenCalledWith('from-session')
    expect(verifyPasscode).toHaveBeenCalledWith({
      vaults: [],
      encryptedSample: 'current-proof',
      passcode: 'from-session',
    })
  })

  it('clears and rejects a session that cannot decrypt the current shares', async () => {
    const getPasscodeUnlockSession = vi.fn(async () => ({
      passcode: 'stale-session',
      expiresAt: null as number | null,
    }))
    const setPasscodeUnlockSession = vi.fn(async () => {})
    const clearPasscodeUnlockSession = vi.fn(async () => {})
    const getPasscodeEncryption = vi.fn(async () => ({
      encryptedSample: 'stale-proof',
    }))
    const getVaults = vi.fn(async () => [
      { keyShares: { ecdsa: 'current-encrypted-share' } },
    ])

    vi.mocked(useCore).mockReturnValue({
      canPersistPasscodeUnlockSession: true,
      getPasscodeUnlockSession,
      setPasscodeUnlockSession,
      clearPasscodeUnlockSession,
      getPasscodeEncryption,
      getVaults,
    } as ReturnType<typeof useCore>)
    vi.mocked(verifyPasscode).mockResolvedValue(false)

    const setPasscode = vi.fn()
    vi.mocked(usePasscode).mockReturnValue([null, setPasscode])

    const { result } = renderHook(() =>
      usePasscodeUnlockSession({
        hasPasscodeEncryption: true,
        passcodeAutoLock: null,
      })
    )

    await waitFor(() => {
      expect(result.current.restoreComplete).toBe(true)
      expect(clearPasscodeUnlockSession).toHaveBeenCalled()
    })

    expect(setPasscode).not.toHaveBeenCalled()
    expect(verifyPasscode).toHaveBeenCalledWith({
      vaults: [{ keyShares: { ecdsa: 'current-encrypted-share' } }],
      encryptedSample: 'stale-proof',
      passcode: 'stale-session',
    })
  })

  it('rejected restore finishes pending without applying passcode', async () => {
    const getPasscodeUnlockSession = vi.fn(async () => {
      throw new Error('restore failed')
    })
    const setPasscodeUnlockSession = vi.fn(async () => {})
    const clearPasscodeUnlockSession = vi.fn(async () => {})

    vi.mocked(useCore).mockReturnValue({
      canPersistPasscodeUnlockSession: true,
      getPasscodeUnlockSession,
      setPasscodeUnlockSession,
      clearPasscodeUnlockSession,
    } as ReturnType<typeof useCore>)

    const setPasscode = vi.fn()
    vi.mocked(usePasscode).mockReturnValue([null, setPasscode])

    const { result } = renderHook(() =>
      usePasscodeUnlockSession({
        hasPasscodeEncryption: true,
        passcodeAutoLock: null,
      })
    )

    await waitFor(() => {
      expect(result.current.pendingPasscodeUnlockRestore).toBe(false)
      expect(result.current.restoreComplete).toBe(true)
    })

    expect(setPasscode).not.toHaveBeenCalled()
  })

  it('disabling passcode encryption clears persisted session', async () => {
    const getPasscodeUnlockSession = vi.fn(async () => null)
    const setPasscodeUnlockSession = vi.fn(async () => {})
    const clearPasscodeUnlockSession = vi.fn(async () => {})

    vi.mocked(useCore).mockReturnValue({
      canPersistPasscodeUnlockSession: true,
      getPasscodeUnlockSession,
      setPasscodeUnlockSession,
      clearPasscodeUnlockSession,
    } as ReturnType<typeof useCore>)

    vi.mocked(usePasscode).mockReturnValue([null, vi.fn()])

    const { rerender } = renderHook(
      ({ hasPasscodeEncryption }: { hasPasscodeEncryption: boolean }) =>
        usePasscodeUnlockSession({
          hasPasscodeEncryption,
          passcodeAutoLock: 15,
        }),
      { initialProps: { hasPasscodeEncryption: true } }
    )

    await waitFor(() => {
      expect(getPasscodeUnlockSession).toHaveBeenCalled()
    })

    clearPasscodeUnlockSession.mockClear()

    rerender({ hasPasscodeEncryption: false })

    await waitFor(() => {
      expect(clearPasscodeUnlockSession).toHaveBeenCalled()
    })
  })

  it('enters pending restore immediately when passcode encryption turns on', () => {
    const getPasscodeUnlockSession = vi.fn(
      () =>
        new Promise<{ passcode: string; expiresAt: number | null } | null>(
          () => {}
        )
    )
    const setPasscodeUnlockSession = vi.fn(async () => {})
    const clearPasscodeUnlockSession = vi.fn(async () => {})

    vi.mocked(useCore).mockReturnValue({
      canPersistPasscodeUnlockSession: true,
      getPasscodeUnlockSession,
      setPasscodeUnlockSession,
      clearPasscodeUnlockSession,
    } as ReturnType<typeof useCore>)

    vi.mocked(usePasscode).mockReturnValue([null, vi.fn()])

    const { result, rerender } = renderHook(
      ({ hasPasscodeEncryption }: { hasPasscodeEncryption: boolean }) =>
        usePasscodeUnlockSession({
          hasPasscodeEncryption,
          passcodeAutoLock: 15,
        }),
      { initialProps: { hasPasscodeEncryption: false } }
    )

    expect(result.current.pendingPasscodeUnlockRestore).toBe(false)
    expect(result.current.restoreComplete).toBe(true)

    clearPasscodeUnlockSession.mockClear()
    setPasscodeUnlockSession.mockClear()

    rerender({ hasPasscodeEncryption: true })

    expect(result.current.pendingPasscodeUnlockRestore).toBe(true)
    expect(result.current.restoreComplete).toBe(false)
    expect(clearPasscodeUnlockSession).not.toHaveBeenCalled()
    expect(setPasscodeUnlockSession).not.toHaveBeenCalled()
  })
})
