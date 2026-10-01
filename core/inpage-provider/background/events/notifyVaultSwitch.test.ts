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

import { createVaultSwitchNotifier } from './notifyVaultSwitch'
import { sendEventToApp } from './sendEventToApp'

const mockGetCurrentVaultId = vi.mocked(storage.getCurrentVaultId)
const mockGetVaultAppSessions = vi.mocked(getVaultAppSessions)
const mockSendEventToApp = vi.mocked(sendEventToApp)

const session = (host: string): AppSession => ({
  host,
  url: `https://${host}`,
})

const sessionsByVault: Record<string, Record<string, AppSession>> = {
  'vault-a': { 'a.com': session('a.com') },
  'vault-b': {},
  'vault-c': { 'c.com': session('c.com') },
}

const sentEvents = () =>
  mockSendEventToApp.mock.calls.map(([{ appId, event }]) => ({ appId, event }))

describe('createVaultSwitchNotifier', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetVaultAppSessions.mockImplementation(
      async vaultId => sessionsByVault[vaultId]
    )
  })

  it('disconnects apps of the previous vault and refreshes apps of the new one', async () => {
    const notify = createVaultSwitchNotifier()

    mockGetCurrentVaultId.mockResolvedValue('vault-b')
    await notify({ prevVaultId: 'vault-a' })
    expect(sentEvents()).toEqual([{ appId: 'a.com', event: 'disconnect' }])

    mockSendEventToApp.mockClear()
    mockGetCurrentVaultId.mockResolvedValue('vault-a')
    await notify({ prevVaultId: 'vault-b' })
    expect(sentEvents()).toEqual([{ appId: 'a.com', event: 'accountsChanged' }])
  })

  it('still disconnects the first vault when a middle switch is superseded (A -> B -> C)', async () => {
    const notify = createVaultSwitchNotifier()
    // Both storage changes are handled after the user has landed on C, and
    // the session reads are slow.
    mockGetCurrentVaultId.mockResolvedValue('vault-c')
    mockGetVaultAppSessions.mockImplementation(async vaultId => {
      await new Promise(resolve => setTimeout(resolve, 5))
      return sessionsByVault[vaultId]
    })

    await Promise.all([
      notify({ prevVaultId: 'vault-a' }),
      notify({ prevVaultId: 'vault-b' }),
    ])

    expect(sentEvents()).toEqual([
      { appId: 'a.com', event: 'disconnect' },
      { appId: 'c.com', event: 'accountsChanged' },
    ])
  })

  it('sends nothing when a burst of switches ends on the starting vault (A -> B -> A)', async () => {
    const notify = createVaultSwitchNotifier()
    mockGetCurrentVaultId.mockResolvedValue('vault-a')

    await Promise.all([
      notify({ prevVaultId: 'vault-a' }),
      notify({ prevVaultId: 'vault-b' }),
    ])

    expect(mockSendEventToApp).not.toHaveBeenCalled()
  })

  it('does nothing without a previous vault', async () => {
    const notify = createVaultSwitchNotifier()
    mockGetCurrentVaultId.mockResolvedValue('vault-a')

    await notify({ prevVaultId: null })

    expect(mockSendEventToApp).not.toHaveBeenCalled()
  })
})
