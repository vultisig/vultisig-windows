import { isHasFinishedOnboardingInitially } from '@core/ui/storage/onboarding'
import { ReferralsOnboardingStorage } from '@core/ui/storage/referrals'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { getPersistentState } from '@lib/ui/state/persistent/getPersistentState'
import { setPersistentState } from '@lib/ui/state/persistent/setPersistentState'

export const referralsStorage: ReferralsOnboardingStorage = {
  getHasFinishedReferralsOnboarding: async () => {
    return getPersistentState(
      StorageKey.hasFinishedReferralsOnboarding,
      isHasFinishedOnboardingInitially
    )
  },
  setHasFinishedReferralsOnboarding: async hasFinishedReferralsOnboarding => {
    await setPersistentState(
      StorageKey.hasFinishedReferralsOnboarding,
      hasFinishedReferralsOnboarding
    )
  },
}
