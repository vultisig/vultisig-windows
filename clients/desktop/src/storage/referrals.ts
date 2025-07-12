import {
  isHasFinishedReferralsOnboardingInitially,
  ReferralsOnboardingStorage,
} from '@core/ui/storage/referrals'
import { StorageKey } from '@core/ui/storage/StorageKey'

import { persistentStorage } from '../state/persistentState'

export const referralsStorage: ReferralsOnboardingStorage = {
  getHasFinishedReferralsOnboarding: async () => {
    const value = persistentStorage.getItem<boolean>(
      StorageKey.hasFinishedReferralsOnboarding
    )

    if (value === undefined) {
      return isHasFinishedReferralsOnboardingInitially
    }

    return value
  },
  setHasFinishedReferralsOnboarding: async hasFinishedReferralsOnboarding => {
    persistentStorage.setItem(
      StorageKey.hasFinishedReferralsOnboarding,
      hasFinishedReferralsOnboarding
    )
  },
}
