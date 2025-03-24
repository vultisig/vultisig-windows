import {
  PersistentStateKey,
  usePersistentState,
} from '@core/ui/state/persistentState'

export const useHasFinishedOnboarding = () => {
  return usePersistentState<boolean>(
    PersistentStateKey.HasFinishedOnboarding,
    false
  )
}
