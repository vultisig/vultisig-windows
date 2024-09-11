import {
  PersistentStateKey,
  usePersistentState,
} from '../../state/persistentState';

export const useHasFinishedOnboarding = () => {
  return usePersistentState<boolean>(
    PersistentStateKey.HasFinishedOnboarding,
    false
  );
};
