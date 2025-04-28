import { hasFinishedOnboardingQueryKey } from '@core/ui/query/keys'

import { usePersistentStateMutation } from '../../../state/persistent/usePersistentStateMutation'
import { usePersistentStateQuery } from '../../../state/persistent/usePersistentStateQuery'

const [key] = hasFinishedOnboardingQueryKey
export const useHasFinishedOnboarding = () => {
  return usePersistentStateQuery<boolean>(key, false)
}

export const useHasFinishedOnboardingMutation = () => {
  return usePersistentStateMutation<boolean>(key)
}
