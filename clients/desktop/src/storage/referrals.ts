import {
  isHasFinishedReferralsOnboardingInitially,
  ReferralsStorage,
} from '@core/ui/storage/referrals'
import { StorageKey } from '@core/ui/storage/StorageKey'

import { persistentStorage } from '../state/persistentState'

export const referralsStorage: ReferralsStorage = {
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
  getFriendReferral: async () => {
    const value = persistentStorage.getItem<string>(
      StorageKey.hasAddedFriendReferral
    )

    if (value === undefined) {
      return null
    }

    return value
  },
  setFriendReferral: async hasAddedFriendReferral => {
    persistentStorage.setItem(
      StorageKey.hasAddedFriendReferral,
      hasAddedFriendReferral
    )
  },
}
