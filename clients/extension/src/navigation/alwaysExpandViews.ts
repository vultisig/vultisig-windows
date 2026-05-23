import { AppViewId } from './AppView'

const alwaysExpandViews: ReadonlySet<AppViewId> = new Set<AppViewId>([
  'importVault',
  'setupVault',
])

/**
 * Returns true when the given view should be opened in an expanded tab instead of the popup.
 */
export const shouldAlwaysExpand = (viewId: AppViewId): boolean => {
  return alwaysExpandViews.has(viewId)
}
