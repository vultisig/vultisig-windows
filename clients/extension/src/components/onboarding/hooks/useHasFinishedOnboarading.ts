import { PersistentStateKey } from '../../../state/persistent/PersistentStateKey'
import { usePersistentStateMutation } from '../../../state/persistent/usePersistentStateMutation'
import { usePersistentStateQuery } from '../../../state/persistent/usePersistentStateQuery'

const queryKey: PersistentStateKey = ['hasFinishedOnboarding']

export const useHasFinishedOnboarding = () => {
  return usePersistentStateQuery<boolean>(queryKey, false)
}

export const useHasFinishedOnboardingMutation = () => {
  return usePersistentStateMutation<boolean>(queryKey)
}
