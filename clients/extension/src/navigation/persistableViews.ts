import { getLastItem } from '@vultisig/lib-utils/array/getLastItem'

import { AppView, AppViewId } from './AppView'

const persistableViews: ReadonlySet<AppViewId> = new Set<AppViewId>([
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
])

/**
 * Whether views with this id may be written to extension storage so the
 * popup can reopen on them.
 */
export const shouldPersistView = (viewId: AppViewId): boolean => {
  return persistableViews.has(viewId)
}

const canPersistView = (view: AppView): boolean => {
  if (!shouldPersistView(view.id)) {
    return false
  }

  // Key import input holds the seed phrase or private key being imported.
  if (view.id === 'setupVault' && view.state.keyImportInput) {
    return false
  }

  return true
}

/**
 * Reduces a navigation history to what may be written to disk, or `null` when
 * the current view must not be persisted. Views that are not safe to store
 * are dropped from the stack, so their state never reaches extension storage.
 */
export const getPersistableHistory = (history: AppView[]): AppView[] | null => {
  if (!canPersistView(getLastItem(history))) {
    return null
  }

  return history.filter(canPersistView)
}
