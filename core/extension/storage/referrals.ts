import { isHasFinishedOnboardingInitially } from '@core/ui/storage/onboarding'
import { ReferralsStorage } from '@core/ui/storage/referrals'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'

export const referralsStorage: ReferralsStorage = {
  getHasFinishedReferralsOnboarding: async () => {
    return getStorageValue(
      StorageKey.hasFinishedReferralsOnboarding,
      isHasFinishedOnboardingInitially
    )
  },
  setHasFinishedReferralsOnboarding: async hasFinishedReferralsOnboarding => {
    await setStorageValue(
      StorageKey.hasFinishedReferralsOnboarding,
      hasFinishedReferralsOnboarding
    )
  },
  getFriendReferral: async () => {
    return getStorageValue(StorageKey.hasAddedFriendReferral, null)
  },
  setFriendReferral: async hasAddedFriendReferral => {
    await setStorageValue(
      StorageKey.hasAddedFriendReferral,
      hasAddedFriendReferral
    )
  },
}
