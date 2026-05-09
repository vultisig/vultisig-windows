import { AppViewId } from './AppView'

const alwaysExpandViews: ReadonlySet<AppViewId> = new Set<AppViewId>([
  'importVault',
  'setupVault',
])

export const shouldAlwaysExpand = (viewId: AppViewId): boolean => {
  return alwaysExpandViews.has(viewId)
}
