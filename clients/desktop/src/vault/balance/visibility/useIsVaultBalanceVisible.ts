import {
  PersistentStateKey,
  usePersistentState,
} from '@core/ui/state/persistentState'

export const useIsVaultBalanceVisible = () => {
  return usePersistentState<boolean>(
    PersistentStateKey.IsVaultBalanceVisible,
    true
  )
}
