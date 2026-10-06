import { AppSession } from '@core/extension/storage/appSessions'
import { describe, expect, it } from 'vitest'

import { getVaultSwitchEvents } from './getVaultSwitchEvents'

const session = (host: string): AppSession => ({
  host,
  url: `https://${host}`,
})

describe('getVaultSwitchEvents', () => {
  it('disconnects apps connected only to the previous vault', () => {
    expect(
      getVaultSwitchEvents({
        prevVaultSessions: { 'a.com': session('a.com') },
        nextVaultSessions: {},
      })
    ).toEqual({ disconnect: ['a.com'], accountsChanged: [] })
  })

  it('asks apps connected to both vaults to re-read their accounts', () => {
    expect(
      getVaultSwitchEvents({
        prevVaultSessions: { 'a.com': session('a.com') },
        nextVaultSessions: { 'a.com': session('a.com') },
      })
    ).toEqual({ disconnect: [], accountsChanged: ['a.com'] })
  })

  it('asks apps connected only to the new vault to re-read their accounts', () => {
    expect(
      getVaultSwitchEvents({
        prevVaultSessions: {},
        nextVaultSessions: { 'b.com': session('b.com') },
      })
    ).toEqual({ disconnect: [], accountsChanged: ['b.com'] })
  })

  it('handles a mix of apps', () => {
    expect(
      getVaultSwitchEvents({
        prevVaultSessions: {
          'a.com': session('a.com'),
          'both.com': session('both.com'),
        },
        nextVaultSessions: {
          'both.com': session('both.com'),
          'b.com': session('b.com'),
        },
      })
    ).toEqual({ disconnect: ['a.com'], accountsChanged: ['both.com', 'b.com'] })
  })

  it('notifies nobody when neither vault has sessions', () => {
    expect(
      getVaultSwitchEvents({ prevVaultSessions: {}, nextVaultSessions: {} })
    ).toEqual({ disconnect: [], accountsChanged: [] })
  })
})
