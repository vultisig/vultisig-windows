import { PersistentStateKey } from '../../../state/persistent/PersistentStateKey'
import { usePersistentStateMutation } from '../../../state/persistent/usePersistentStateMutation'
import { usePersistentStateQuery } from '../../../state/persistent/usePersistentStateQuery'

export const useHasFinishedOnboardingQuery = () => {
  return usePersistentStateQuery<boolean>(
    PersistentStateKey.HasFinishedOnboarding,
    false
  )
}

export const useHasFinishedOnboardingMutationMutation = () => {
  return usePersistentStateMutation<boolean>(
    PersistentStateKey.HasFinishedOnboarding
  )
}
