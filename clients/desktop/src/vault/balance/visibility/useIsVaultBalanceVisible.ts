import { PersistentStateKey } from '@core/ui/state/PersistentStateKey'
import { usePersistentState } from '../../../state/persistentState'

export const useIsVaultBalanceVisible = () => {
  return usePersistentState<boolean>(
    PersistentStateKey.IsVaultBalanceVisible,
    true
  )
}
