import {
  isHasFinishedOnboardingInitially,
  OnboardingStorage,
} from '@core/ui/storage/onboarding'
import { StorageKey } from '@core/ui/storage/StorageKey'

import { getPersistentState } from '../state/persistent/getPersistentState'
import { setPersistentState } from '../state/persistent/setPersistentState'

export const onboardingStorage: OnboardingStorage = {
  getHasFinishedOnboarding: async () => {
    return getPersistentState(
      StorageKey.hasFinishedOnboarding,
      isHasFinishedOnboardingInitially
    )
  },
  setHasFinishedOnboarding: async hasFinishedOnboarding => {
    await setPersistentState(
      StorageKey.hasFinishedOnboarding,
      hasFinishedOnboarding
    )
  },
}
