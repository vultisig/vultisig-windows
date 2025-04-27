import { PersistentStateKey } from '@core/ui/state/PersistentStateKey'
import { usePersistentState } from '../../state/persistentState'

export const useHasFinishedOnboarding = () => {
  return usePersistentState<boolean>(
    PersistentStateKey.HasFinishedOnboarding,
    false
  )
}
