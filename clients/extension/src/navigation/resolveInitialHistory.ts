import { initialCoreView } from '@core/ui/navigation/CoreView'

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
  persistedHistory: AppView[] | null
  hasVaults: boolean
}

/**
 * Computes the navigation history the extension should open with.
 *
 * With no vaults in storage, a stored initial view is only honored when it is
 * part of onboarding (e.g. reopening setup in an expanded tab), and persisted
 * history is ignored entirely — otherwise a stale history like
 * `[vault, setupVault]` would skip the no-vault splash and land the user on
 * vault setup directly.
 */
export const resolveInitialHistory = ({
  initialView,
  persistedHistory,
  hasVaults,
}: ResolveInitialHistoryInput): AppView[] => {
  if (initialView && (hasVaults || onboardingViews.has(initialView.id))) {
    if (initialView.id === initialCoreView.id) {
      return [initialView]
    }
    return [initialCoreView, initialView]
  }

  if (hasVaults && persistedHistory && persistedHistory.length > 0) {
    return persistedHistory
  }

  return [initialCoreView]
}
