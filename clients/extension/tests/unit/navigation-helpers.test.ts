import { describe, expect, it } from 'vitest'

import { shouldAlwaysExpand } from '@clients/extension/src/navigation/alwaysExpandViews'
import { shouldPersistView } from '@clients/extension/src/navigation/persistableViews'

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

describe('shouldPersistView', () => {
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
    'returns true for persistable view: %s',
    viewId => {
      expect(shouldPersistView(asViewId(viewId))).toBe(true)
    }
  )

  it('returns false for onboarding', () => {
    expect(shouldPersistView(asViewId('onboarding'))).toBe(false)
  })

  it('returns false for connectedDapps', () => {
    expect(shouldPersistView(asViewId('connectedDapps'))).toBe(false)
  })

  it('returns false for random unknown view ID', () => {
    expect(shouldPersistView(asViewId('randomUnknownView'))).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(shouldPersistView(asViewId(''))).toBe(false)
  })

  it('returns false for home', () => {
    expect(shouldPersistView(asViewId('home'))).toBe(false)
  })

  it('has exactly 19 persistable views', () => {
    expect(persistableViewIds.length).toBe(19)
  })
})
