import {
  AppSession,
  VaultsAppSessions,
} from '@core/extension/storage/appSessions'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { Vault } from '@vultisig/core-mpc/vault/Vault'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const storageState = vi.hoisted(() => ({
  sessions: {} as VaultsAppSessions,
  currentVaultId: null as string | null,
  vaultIds: [] as string[],
}))

vi.mock('@core/extension/storage', () => ({
  storage: {
    getCurrentVaultId: async () => storageState.currentVaultId,
    getVaults: async () =>
      storageState.vaultIds.map(ecdsa => ({ publicKeys: { ecdsa } })),
  },
}))
vi.mock('@core/extension/storage/appSessions', () => ({
  getVaultsAppSessions: async () => storageState.sessions,
}))
vi.mock('./sendEventToApp', () => ({
  sendEventToApp: vi.fn(),
}))

import { createSiteSessionNotifier } from './notifySiteSessionChanges'
import { sendEventToApp } from './sendEventToApp'

const mockSendEventToApp = vi.mocked(sendEventToApp)

const session = (host: string, selectedEVMChainId?: string): AppSession => ({
  host,
  url: `https://${host}`,
  ...(selectedEVMChainId ? { selectedEVMChainId } : {}),
})

const sentEvents = () =>
  mockSendEventToApp.mock.calls.map(([{ appId, event }]) => ({ appId, event }))

const vaults = (...vaultIds: string[]) =>
  vaultIds.map(ecdsa => ({ publicKeys: { ecdsa } }) as Vault)

/** Applies a storage write and returns the change the listener receives. */
const write = (next: Partial<typeof storageState>) => {
  const changes: Record<string, chrome.storage.StorageChange> = {}
  if (next.sessions) {
    changes[StorageKey.appSessions] = {
      oldValue: storageState.sessions,
      newValue: next.sessions,
    }
  }
  if (next.currentVaultId !== undefined) {
    changes[StorageKey.currentVaultId] = {
      oldValue: storageState.currentVaultId,
      newValue: next.currentVaultId,
    }
  }
  if (next.vaultIds) {
    changes[StorageKey.vaults] = {
      oldValue: vaults(...storageState.vaultIds),
      newValue: vaults(...next.vaultIds),
    }
  }
  Object.assign(storageState, next)
  return changes
}

describe('createSiteSessionNotifier', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    storageState.sessions = {
      'vault-a': { 'a.com': session('a.com') },
      'vault-b': { 'b.com': session('b.com') },
    }
    storageState.currentVaultId = 'vault-a'
    storageState.vaultIds = ['vault-a', 'vault-b', 'vault-c']
  })

  it('keeps sites connected to other vaults when the current vault changes', async () => {
    const notify = createSiteSessionNotifier()

    await notify(write({ currentVaultId: 'vault-b' }))
    await notify(write({ currentVaultId: 'vault-c' }))

    expect(mockSendEventToApp).not.toHaveBeenCalled()
  })

  it('keeps the first site connected when a second site connects with another vault', async () => {
    const notify = createSiteSessionNotifier()

    await notify(
      write({
        sessions: {
          ...storageState.sessions,
          'vault-c': { 'c.com': session('c.com') },
        },
      })
    )
    await notify(write({ currentVaultId: 'vault-c' }))

    expect(mockSendEventToApp).not.toHaveBeenCalled()
  })

  it('disconnects a site whose session is removed', async () => {
    const notify = createSiteSessionNotifier()

    await notify(
      write({ sessions: { 'vault-b': { 'b.com': session('b.com') } } })
    )

    expect(sentEvents()).toEqual([{ appId: 'a.com', event: 'disconnect' }])
  })

  it('asks a site to re-read its accounts when it reconnects with another vault', async () => {
    const notify = createSiteSessionNotifier()

    await notify(
      write({
        sessions: {
          'vault-a': {},
          'vault-b': { 'a.com': session('a.com'), 'b.com': session('b.com') },
        },
      })
    )

    expect(sentEvents()).toEqual([{ appId: 'a.com', event: 'accountsChanged' }])
  })

  it('disconnects the sites of a deleted vault', async () => {
    const notify = createSiteSessionNotifier()

    await notify(write({ vaultIds: ['vault-a', 'vault-c'] }))

    expect(sentEvents()).toEqual([{ appId: 'b.com', event: 'disconnect' }])
  })

  it("reports a site's EVM chain change whichever vault is current", async () => {
    const notify = createSiteSessionNotifier()

    await notify(
      write({
        sessions: {
          ...storageState.sessions,
          'vault-b': { 'b.com': session('b.com', '0x89') },
        },
      })
    )

    expect(mockSendEventToApp).toHaveBeenCalledWith({
      appId: 'b.com',
      event: 'evmChainChanged',
      value: '0x89',
    })
  })

  it('moves a site held by several vaults with the current vault', async () => {
    storageState.sessions = {
      'vault-a': { 'x.com': session('x.com') },
      'vault-b': { 'x.com': session('x.com') },
    }
    const notify = createSiteSessionNotifier()

    await notify(write({ currentVaultId: 'vault-b' }))
    await notify(write({ currentVaultId: 'vault-c' }))

    expect(sentEvents()).toEqual([
      { appId: 'x.com', event: 'accountsChanged' },
      { appId: 'x.com', event: 'disconnect' },
    ])
  })

  it('sends each event once for a burst of changes handled after it landed', async () => {
    const notify = createSiteSessionNotifier()
    const removeSite = write({
      sessions: { 'vault-b': { 'b.com': session('b.com') } },
    })
    const switchVault = write({ currentVaultId: 'vault-b' })

    await Promise.all([notify(removeSite), notify(switchVault)])

    expect(sentEvents()).toEqual([{ appId: 'a.com', event: 'disconnect' }])
  })

  it('diffs the first change after the worker starts against its old values', async () => {
    const notify = createSiteSessionNotifier()

    await notify(write({ sessions: {} }))

    expect(sentEvents()).toEqual([
      { appId: 'a.com', event: 'disconnect' },
      { appId: 'b.com', event: 'disconnect' },
    ])
  })
})
