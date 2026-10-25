import { describe, expect, it } from 'vitest'

import { SiteSessions } from '../core/appSession'
import { getSiteSessionEvents } from './getSiteSessionEvents'

const served = (sites: Record<string, string>): SiteSessions =>
  Object.fromEntries(
    Object.entries(sites).map(([host, vaultId]) => [
      host,
      { host, url: `https://${host}`, vaultId },
    ])
  )

describe('getSiteSessionEvents', () => {
  it('disconnects a site no vault serves anymore', () => {
    expect(
      getSiteSessionEvents({
        prevSiteSessions: served({ 'a.com': 'vault-a' }),
        nextSiteSessions: {},
      })
    ).toEqual({ disconnect: ['a.com'], accountsChanged: [] })
  })

  it('asks a site now served by another vault to re-read its accounts', () => {
    expect(
      getSiteSessionEvents({
        prevSiteSessions: served({ 'a.com': 'vault-a' }),
        nextSiteSessions: served({ 'a.com': 'vault-b' }),
      })
    ).toEqual({ disconnect: [], accountsChanged: ['a.com'] })
  })

  it('leaves alone sites that keep their vault and sites that just connected', () => {
    expect(
      getSiteSessionEvents({
        prevSiteSessions: served({ 'a.com': 'vault-a' }),
        nextSiteSessions: served({ 'a.com': 'vault-a', 'b.com': 'vault-b' }),
      })
    ).toEqual({ disconnect: [], accountsChanged: [] })
  })

  it('handles a mix of sites', () => {
    expect(
      getSiteSessionEvents({
        prevSiteSessions: served({
          'gone.com': 'vault-a',
          'moved.com': 'vault-a',
          'kept.com': 'vault-b',
        }),
        nextSiteSessions: served({
          'moved.com': 'vault-b',
          'kept.com': 'vault-b',
        }),
      })
    ).toEqual({ disconnect: ['gone.com'], accountsChanged: ['moved.com'] })
  })
})
