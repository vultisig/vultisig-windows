import { AppView, AppViewId } from './AppView'

const alwaysExpandViews: ReadonlySet<AppViewId> = new Set<AppViewId>([
  'importVault',
  'setupVault',
  'uploadQr',
  'joinKeygen',
  'joinKeysign',
])

/**
 * Returns true when the given view should be opened in an expanded tab instead of the popup.
 */
export const shouldAlwaysExpand = (viewId: AppViewId): boolean => {
  return alwaysExpandViews.has(viewId)
}

/**
 * Like `shouldAlwaysExpand`, but also looks at the view's state: a Secure
 * Vault keysign waits on another device, so it can't run in a popup that
 * closes on blur.
 */
export const shouldAlwaysExpandView = (view: AppView): boolean => {
  if (view.id === 'keysign') {
    return view.state.securityType === 'secure'
  }

  return shouldAlwaysExpand(view.id)
}
