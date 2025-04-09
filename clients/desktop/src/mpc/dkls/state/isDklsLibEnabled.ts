import {
  PersistentStateKey,
  usePersistentState,
} from '../../../state/persistentState'

export const useIsDklsLibEnabled = () => {
  return usePersistentState(PersistentStateKey.IsDklsLibEnabled, true)
}
