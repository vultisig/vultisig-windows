import { usePersistentState } from '../../state/persistentState'
import { PersistentStateKey } from '../../state/persistentState'

export const useIsDklsLibEnabled = () => {
  return usePersistentState(PersistentStateKey.IsDklsLibEnabled, true)
}
