import { usePersistentStateMutation } from '../../../state/persistent/usePersistentStateMutation'
import { usePersistentStateQuery } from '../../../state/persistent/usePersistentStateQuery'

const key = 'hasFinishedOnboarding'

export const useHasFinishedOnboarding = () => {
  return usePersistentStateQuery<boolean>(key, false)
}

export const useHasFinishedOnboardingMutation = () => {
  return usePersistentStateMutation<boolean>(key)
}
