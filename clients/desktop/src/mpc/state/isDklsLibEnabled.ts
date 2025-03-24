import { usePersistentState } from '@core/ui/state/persistentState'
import { PersistentStateKey } from '@core/ui/state/persistentState'

export const useIsDklsLibEnabled = () => {
  return usePersistentState(PersistentStateKey.IsDklsLibEnabled, true)
}
