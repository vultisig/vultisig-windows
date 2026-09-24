import { initialCoreView } from '@core/ui/navigation/CoreView'
import { View } from '@lib/ui/navigation/View'

import { AppView, AppViewId } from './AppView'

const onboardingViews: ReadonlySet<AppViewId> = new Set<AppViewId>([
  'onboarding',
  'newVault',
  'setupVault',
  'setupVaultOverview',
  'importVault',
  'importSeedphrase',
  'joinKeygen',
])

type ResolveInitialHistoryInput = {
  initialView: AppView | null
  persistedView: View | null
  hasVaults: boolean
}

const withInitialCoreViewBelow = (view: View): View[] =>
  view.id === initialCoreView.id ? [view] : [initialCoreView, view]

/**
 * Computes the navigation history the extension should open with. A stored
 * view opens on top of the initial core view, so back leads home.
 *
 * With no vaults in storage, a stored initial view is only honored when it is
 * part of onboarding (e.g. reopening setup in an expanded tab), and the
 * persisted view is ignored entirely — otherwise a stale `setupVault` would
 * skip the no-vault splash and land the user on vault setup directly.
 */
export const resolveInitialHistory = ({
  initialView,
  persistedView,
  hasVaults,
}: ResolveInitialHistoryInput): View[] => {
  if (initialView && (hasVaults || onboardingViews.has(initialView.id))) {
    return withInitialCoreViewBelow(initialView)
  }

  if (hasVaults && persistedView) {
    return withInitialCoreViewBelow(persistedView)
  }

  return [initialCoreView]
}
