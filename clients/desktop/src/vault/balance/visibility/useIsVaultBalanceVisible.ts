import {
  PersistentStateKey,
  usePersistentState,
} from '../../../state/persistentState';

export const useIsVaultBalanceVisible = () => {
  return usePersistentState<boolean>(
    PersistentStateKey.IsVaultBalanceVisible,
    true
  );
};
