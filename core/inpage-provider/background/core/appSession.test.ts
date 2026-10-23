import { AppSession } from '@core/extension/storage/appSessions'
import { describe, expect, it } from 'vitest'

import { resolveSiteSessions } from './appSession'

const session = (host: string): AppSession => ({
  host,
  url: `https://${host}`,
})

describe('resolveSiteSessions', () => {
  it('serves each site by the vault it connected with, whichever vault is current', () => {
    const siteSessions = resolveSiteSessions({
      sessions: {
        'vault-a': { 'a.com': session('a.com') },
        'vault-b': { 'b.com': session('b.com') },
      },
      currentVaultId: 'vault-b',
      vaultIds: ['vault-a', 'vault-b'],
    })

    expect(siteSessions).toEqual({
      'a.com': { ...session('a.com'), vaultId: 'vault-a' },
      'b.com': { ...session('b.com'), vaultId: 'vault-b' },
    })
  })

  it('ignores sessions left behind by a deleted vault', () => {
    const siteSessions = resolveSiteSessions({
      sessions: { 'deleted-vault': { 'a.com': session('a.com') } },
      currentVaultId: 'vault-b',
      vaultIds: ['vault-b'],
    })

    expect(siteSessions).toEqual({})
  })

  it('serves a site held by several vaults by the current one', () => {
    const siteSessions = resolveSiteSessions({
      sessions: {
        'vault-a': { 'x.com': session('x.com') },
        'vault-b': { 'x.com': session('x.com') },
      },
      currentVaultId: 'vault-b',
      vaultIds: ['vault-a', 'vault-b'],
    })

    expect(siteSessions['x.com']?.vaultId).toBe('vault-b')
  })

  it('serves no vault when several hold the site and none is current', () => {
    const siteSessions = resolveSiteSessions({
      sessions: {
        'vault-a': { 'x.com': session('x.com') },
        'vault-b': { 'x.com': session('x.com') },
      },
      currentVaultId: 'vault-c',
      vaultIds: ['vault-a', 'vault-b', 'vault-c'],
    })

    expect(siteSessions).toEqual({})
  })

  it('serves no site when there is no vault', () => {
    const siteSessions = resolveSiteSessions({
      sessions: { 'vault-a': { 'a.com': session('a.com') } },
      currentVaultId: null,
      vaultIds: [],
    })

    expect(siteSessions).toEqual({})
  })
})
