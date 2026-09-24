import { describe, expect, it } from 'vitest'

import { shouldAlwaysExpand } from '@clients/extension/src/navigation/alwaysExpandViews'
import { getPersistableView } from '@clients/extension/src/navigation/persistableViews'

// Cast helper for type safety in tests
const asViewId = (id: string) => id as any

describe('shouldAlwaysExpand', () => {
  it('returns true for setupVault', () => {
    expect(shouldAlwaysExpand(asViewId('setupVault'))).toBe(true)
  })

  it('returns false for vault', () => {
    expect(shouldAlwaysExpand(asViewId('vault'))).toBe(false)
  })

  it('returns false for settings', () => {
    expect(shouldAlwaysExpand(asViewId('settings'))).toBe(false)
  })

  it('returns false for send', () => {
    expect(shouldAlwaysExpand(asViewId('send'))).toBe(false)
  })

  it('returns false for unknown view', () => {
    expect(shouldAlwaysExpand(asViewId('unknownView'))).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(shouldAlwaysExpand(asViewId(''))).toBe(false)
  })
})

describe('getPersistableView by view id', () => {
  const isPersisted = (id: string) => getPersistableView([{ id }]) !== null

  const persistableViewIds = [
    'addressBook',
    'createAddressBookItem',
    'createVaultFolder',
    'defi',
    'defiChainDetail',
    'deposit',
    'importVault',
    'manageDefiChains',
    'manageVaultChains',
    'referral',
    'send',
    'settings',
    'setupVault',
    'signCustomMessage',
    'swap',
    'updateAddressBookItem',
    'vault',
    'vaultChainDetail',
    'vaultSettings',
  ]

  it.each(persistableViewIds)(
    'persists view: %s',
    viewId => {
      expect(isPersisted(viewId)).toBe(true)
    }
  )

  it('returns false for onboarding', () => {
    expect(isPersisted('onboarding')).toBe(false)
  })

  it('returns false for connectedDapps', () => {
    expect(isPersisted('connectedDapps')).toBe(false)
  })

  it('returns false for random unknown view ID', () => {
    expect(isPersisted('randomUnknownView')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isPersisted('')).toBe(false)
  })

  it('returns false for home', () => {
    expect(isPersisted('home')).toBe(false)
  })

  it('has exactly 19 persistable views', () => {
    expect(persistableViewIds.length).toBe(19)
  })
})
