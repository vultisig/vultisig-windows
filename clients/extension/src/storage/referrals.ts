import { isHasFinishedOnboardingInitially } from '@core/ui/storage/onboarding'
import { ReferralsStorage } from '@core/ui/storage/referrals'
import { StorageKey } from '@core/ui/storage/StorageKey'

import { getPersistentState } from '../state/persistent/getPersistentState'
import { setPersistentState } from '../state/persistent/setPersistentState'

export const referralsStorage: ReferralsStorage = {
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
  getFriendReferral: async () => {
    return getPersistentState(StorageKey.hasAddedFriendReferral, null)
  },
  setFriendReferral: async hasAddedFriendReferral => {
    await setPersistentState(
      StorageKey.hasAddedFriendReferral,
      hasAddedFriendReferral
    )
  },
}
