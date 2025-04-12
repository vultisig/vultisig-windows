import { PersistentStateKey } from '@clients/extension/src/state/persistent/PersistentStateKey'
import { usePersistentStateMutation } from '@clients/extension/src/state/persistent/usePersistentStateMutation'
import { usePersistentStateQuery } from '@clients/extension/src/state/persistent/usePersistentStateQuery'

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
