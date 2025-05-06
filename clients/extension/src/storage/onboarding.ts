import { hasFinishedOnboardingQueryKey } from '@core/ui/query/keys'
import {
  GetHasFinishedOnboardingFunction,
  isHasFinishedOnboardingInitially,
  SetHasFinishedOnboardingFunction,
} from '@core/ui/storage/CoreStorage'

import { getPersistentState } from '../state/persistent/getPersistentState'
import { setPersistentState } from '../state/persistent/setPersistentState'

const [key] = hasFinishedOnboardingQueryKey

export const getHasFinishedOnboarding: GetHasFinishedOnboardingFunction =
  async () => {
    return getPersistentState(key, isHasFinishedOnboardingInitially)
  }

export const setHasFinishedOnboarding: SetHasFinishedOnboardingFunction =
  async hasFinishedOnboarding => {
    await setPersistentState(key, hasFinishedOnboarding)
  }
