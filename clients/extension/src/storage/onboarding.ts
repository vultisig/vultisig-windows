import {
  GetHasFinishedOnboardingFunction,
  isHasFinishedOnboardingInitially,
  SetHasFinishedOnboardingFunction,
} from '@core/ui/storage/CoreStorage'
import { StorageKey } from '@core/ui/storage/StorageKey'

import { getPersistentState } from '../state/persistent/getPersistentState'
import { setPersistentState } from '../state/persistent/setPersistentState'

export const getHasFinishedOnboarding: GetHasFinishedOnboardingFunction =
  async () => {
    return getPersistentState(
      StorageKey.hasFinishedOnboarding,
      isHasFinishedOnboardingInitially
    )
  }

export const setHasFinishedOnboarding: SetHasFinishedOnboardingFunction =
  async hasFinishedOnboarding => {
    await setPersistentState(
      StorageKey.hasFinishedOnboarding,
      hasFinishedOnboarding
    )
  }
