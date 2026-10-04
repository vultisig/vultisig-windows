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

  it.each([
    { nextVaultId: 'vault-a', expectedEvents: [] },
    {
      nextVaultId: null,
      expectedEvents: [{ appId: 'a.com', event: 'disconnect' }],
    },
    {
      nextVaultId: 'vault-c',
      expectedEvents: [
        { appId: 'a.com', event: 'disconnect' },
        { appId: 'c.com', event: 'accountsChanged' },
      ],
    },
  ])(
    'reconciles from A when the vault changes to $nextVaultId while reading B sessions',
    async ({ nextVaultId, expectedEvents }) => {
      const notify = createVaultSwitchNotifier()
      const readStarted = Promise.withResolvers<void>()
      const releaseRead = Promise.withResolvers<void>()
      mockGetCurrentVaultId.mockResolvedValue('vault-b')
      mockGetVaultAppSessions.mockImplementation(async vaultId => {
        if (vaultId === 'vault-b') {
          readStarted.resolve()
          await releaseRead.promise
          return { 'b.com': session('b.com') }
        }
        return sessionsByVault[vaultId]
      })

      const firstSwitch = notify({ prevVaultId: 'vault-a' })
      await readStarted.promise
      expect(mockSendEventToApp).not.toHaveBeenCalled()

      mockGetCurrentVaultId.mockResolvedValue(nextVaultId)
      const secondSwitch = notify({ prevVaultId: 'vault-b' })
      releaseRead.resolve()
      await Promise.all([firstSwitch, secondSwitch])

      expect(sentEvents()).toEqual(expectedEvents)
    }
  )

  it('refreshes saved sessions when activating a vault from no current vault', async () => {
    const notify = createVaultSwitchNotifier()
    mockGetCurrentVaultId.mockResolvedValue('vault-a')

    await notify({ prevVaultId: null })

    expect(sentEvents()).toEqual([{ appId: 'a.com', event: 'accountsChanged' }])
  })

  it('disconnects and restores saved sessions across a completed A -> null -> A transition', async () => {
    const notify = createVaultSwitchNotifier()
    mockGetCurrentVaultId.mockResolvedValue(null)
    await notify({ prevVaultId: 'vault-a' })

    mockGetCurrentVaultId.mockResolvedValue('vault-a')
    await notify({ prevVaultId: null })

    expect(sentEvents()).toEqual([
      { appId: 'a.com', event: 'disconnect' },
      { appId: 'a.com', event: 'accountsChanged' },
    ])
  })

  it('does nothing when both the previous and current vault are null', async () => {
    const notify = createVaultSwitchNotifier()
    mockGetCurrentVaultId.mockResolvedValue(null)

    await notify({ prevVaultId: null })

    expect(mockSendEventToApp).not.toHaveBeenCalled()
    expect(mockGetVaultAppSessions).not.toHaveBeenCalled()
  })
})
