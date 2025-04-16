import { PersistentStateKey } from '../../../../state/persistent/PersistentStateKey'
import { usePersistentStateMutation } from '../../../../state/persistent/usePersistentStateMutation'
import { usePersistentStateQuery } from '../../../../state/persistent/usePersistentStateQuery'

export const useHasFinishedOnboarding = () => {
  return usePersistentStateQuery<boolean>(
    PersistentStateKey.HasFinishedOnboarding,
    false
  )
}

export const useHasFinishedOnboardingMutation = () => {
  return usePersistentStateMutation<boolean>(
    PersistentStateKey.HasFinishedOnboarding
  )
}
