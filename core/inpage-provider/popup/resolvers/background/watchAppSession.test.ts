import { VaultsAppSessions } from '@core/extension/storage/appSessions'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { describe, expect, it, vi } from 'vitest'

import { BackgroundError } from '../../../background/error'
import { watchAppSession } from './watchAppSession'

type StorageListener = Parameters<
  typeof chrome.storage.onChanged.addListener
>[0]

const appSession = { host: 'example.com', url: 'https://example.com' }

const stubStorage = (initialSessions: VaultsAppSessions) => {
  let sessions = initialSessions
  const listeners = new Set<StorageListener>()

  vi.stubGlobal('chrome', {
    storage: {
      local: {
        get: async (key: string) => ({ [key]: sessions }),
      },
      onChanged: {
        addListener: (listener: StorageListener) => listeners.add(listener),
        removeListener: (listener: StorageListener) =>
          listeners.delete(listener),
      },
    },
  })

  const setSessions = (nextSessions: VaultsAppSessions) => {
    sessions = nextSessions
    listeners.forEach(listener =>
      listener(
        { [StorageKey.appSessions]: { newValue: nextSessions } },
        'local'
      )
    )
  }

  return { listeners, setSessions }
}

describe('watchAppSession', () => {
  it('stays open while the session is kept', async () => {
    const storage = stubStorage({ 'vault-1': { 'example.com': appSession } })

    const { signal } = await watchAppSession({
      vaultId: 'vault-1',
      host: 'example.com',
    })
    storage.setSessions({
      'vault-1': {
        'example.com': appSession,
        'other.com': { host: 'other.com', url: 'https://other.com' },
      },
    })
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(signal.aborted).toBe(false)
  })

  it('aborts with Unauthorized once the session is removed', async () => {
    const storage = stubStorage({ 'vault-1': { 'example.com': appSession } })

    const { signal } = await watchAppSession({
      vaultId: 'vault-1',
      host: 'example.com',
    })
    storage.setSessions({ 'vault-1': {} })

    await vi.waitFor(() => expect(signal.aborted).toBe(true))
    expect(signal.reason).toBe(BackgroundError.Unauthorized)
    expect(storage.listeners.size).toBe(0)
  })

  it('aborts when the site stays connected only to another vault', async () => {
    const storage = stubStorage({
      'vault-1': { 'example.com': appSession },
      'vault-2': { 'example.com': appSession },
    })

    const { signal } = await watchAppSession({
      vaultId: 'vault-1',
      host: 'example.com',
    })
    storage.setSessions({ 'vault-2': { 'example.com': appSession } })

    await vi.waitFor(() => expect(signal.aborted).toBe(true))
  })

  it('is aborted from the start when the session is already gone', async () => {
    stubStorage({})

    const { signal } = await watchAppSession({
      vaultId: 'vault-1',
      host: 'example.com',
    })

    expect(signal.aborted).toBe(true)
  })

  it('ignores storage changes once stopped', async () => {
    const storage = stubStorage({ 'vault-1': { 'example.com': appSession } })

    const { signal, stop } = await watchAppSession({
      vaultId: 'vault-1',
      host: 'example.com',
    })
    stop()
    storage.setSessions({})
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(storage.listeners.size).toBe(0)
    expect(signal.aborted).toBe(false)
  })
})
