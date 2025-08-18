import {
  isHasFinishedOnboardingInitially,
  OnboardingStorage,
} from '@core/ui/storage/onboarding'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'

export const onboardingStorage: OnboardingStorage = {
  getHasFinishedOnboarding: async () => {
    return getStorageValue(
      StorageKey.hasFinishedOnboarding,
      isHasFinishedOnboardingInitially
    )
  },
  setHasFinishedOnboarding: async hasFinishedOnboarding => {
    await setStorageValue(
      StorageKey.hasFinishedOnboarding,
      hasFinishedOnboarding
    )
  },
}
