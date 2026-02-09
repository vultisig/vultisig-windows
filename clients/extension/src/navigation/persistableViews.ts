import { AppViewId } from './AppView'

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

export const shouldPersistView = (viewId: AppViewId): boolean => {
  return persistableViews.has(viewId)
}
