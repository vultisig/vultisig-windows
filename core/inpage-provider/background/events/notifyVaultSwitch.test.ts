import { AppSession } from '@core/extension/storage/appSessions'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@core/extension/storage', () => ({
  storage: { getCurrentVaultId: vi.fn() },
}))
vi.mock('@core/extension/storage/appSessions', () => ({
  getVaultAppSessions: vi.fn(),
}))
vi.mock('./sendEventToApp', () => ({
  sendEventToApp: vi.fn(),
}))

import { storage } from '@core/extension/storage'
import { getVaultAppSessions } from '@core/extension/storage/appSessions'

import { notifyVaultSwitch } from './notifyVaultSwitch'
import { sendEventToApp } from './sendEventToApp'

const mockGetCurrentVaultId = vi.mocked(storage.getCurrentVaultId)
const mockGetVaultAppSessions = vi.mocked(getVaultAppSessions)
const mockSendEventToApp = vi.mocked(sendEventToApp)

const sessionsByVault: Record<string, Record<string, AppSession>> = {
  'vault-a': { 'a.com': { host: 'a.com', url: 'https://a.com' } },
  'vault-b': {},
}

const sentEvents = () =>
  mockSendEventToApp.mock.calls.map(([{ appId, event }]) => ({ appId, event }))

describe('notifyVaultSwitch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetVaultAppSessions.mockImplementation(
      async vaultId => sessionsByVault[vaultId]
    )
  })

  it('disconnects apps of the previous vault and refreshes apps of the new one', async () => {
    mockGetCurrentVaultId.mockResolvedValue('vault-a')

    await notifyVaultSwitch({ prevVaultId: 'vault-b', nextVaultId: 'vault-a' })
    expect(sentEvents()).toEqual([{ appId: 'a.com', event: 'accountsChanged' }])

    mockSendEventToApp.mockClear()
    mockGetCurrentVaultId.mockResolvedValue('vault-b')

    await notifyVaultSwitch({ prevVaultId: 'vault-a', nextVaultId: 'vault-b' })
    expect(sentEvents()).toEqual([{ appId: 'a.com', event: 'disconnect' }])
  })

  it('drops a stale switch whose reads finish after a newer switch (A -> B -> A)', async () => {
    let releaseSlowReads: () => void = () => {}
    const slowReads = new Promise<void>(resolve => {
      releaseSlowReads = resolve
    })

    // The A -> B handler's session reads are slow; the B -> A handler's are not.
    mockGetVaultAppSessions.mockImplementationOnce(async vaultId => {
      await slowReads
      return sessionsByVault[vaultId]
    })
    mockGetVaultAppSessions.mockImplementationOnce(async vaultId => {
      await slowReads
      return sessionsByVault[vaultId]
    })

    const staleSwitch = notifyVaultSwitch({
      prevVaultId: 'vault-a',
      nextVaultId: 'vault-b',
    })

    // By the time anything is dispatched, vault A is current again.
    mockGetCurrentVaultId.mockResolvedValue('vault-a')

    await notifyVaultSwitch({ prevVaultId: 'vault-b', nextVaultId: 'vault-a' })
    releaseSlowReads()
    await staleSwitch

    expect(sentEvents()).toEqual([{ appId: 'a.com', event: 'accountsChanged' }])
  })

  it('does nothing without a previous vault or when the vault did not change', async () => {
    mockGetCurrentVaultId.mockResolvedValue('vault-a')

    await notifyVaultSwitch({ prevVaultId: null, nextVaultId: 'vault-a' })
    await notifyVaultSwitch({ prevVaultId: 'vault-a', nextVaultId: 'vault-a' })

    expect(mockSendEventToApp).not.toHaveBeenCalled()
  })
})
