import { getPersistentState } from '@core/extension/state/persistent/getPersistentState'
import { setPersistentState } from '@core/extension/state/persistent/setPersistentState'
import {
  isHasFinishedOnboardingInitially,
  OnboardingStorage,
} from '@core/ui/storage/onboarding'
import { StorageKey } from '@core/ui/storage/StorageKey'

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
