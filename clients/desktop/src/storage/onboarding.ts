import {
  isHasFinishedOnboardingInitially,
  OnboardingStorage,
} from '@core/ui/storage/onboarding'
import { StorageKey } from '@core/ui/storage/StorageKey'

import { persistentStorage } from '../state/persistentState'

export const onboardingStorage: OnboardingStorage = {
  getHasFinishedOnboarding: async () => {
    const value = persistentStorage.getItem<boolean>(
      StorageKey.hasFinishedOnboarding
    )

    if (value === undefined) {
      return isHasFinishedOnboardingInitially
    }

    return value
  },
  setHasFinishedOnboarding: async hasFinishedOnboarding => {
    persistentStorage.setItem(
      StorageKey.hasFinishedOnboarding,
      hasFinishedOnboarding
    )
  },
}
