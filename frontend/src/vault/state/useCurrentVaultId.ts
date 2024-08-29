import { useCallback } from 'react';
import {
  PersistentStateKey,
  usePersistentState,
} from '../../state/persistentState';
import { useVaults } from '../queries/useVaultsQuery';
import { isEmpty } from '../../lib/utils/array/isEmpty';
import { getVaultId } from '../utils/getVaultId';
import { useStateCorrector } from '../../lib/ui/state/useStateCorrector';

export const useCurrentVaultId = () => {
  const vaults = useVaults();

  const getInitialVaultId = useCallback(() => {
    if (isEmpty(vaults)) return null;

    return getVaultId(vaults[0]);
  }, [vaults]);

  return useStateCorrector(
    usePersistentState<string | null>(
      PersistentStateKey.CurrentVaultId,
      getInitialVaultId
    ),
    id => {
      const vault = vaults.find(vault => getVaultId(vault) === id);
      if (!vault) {
        return getInitialVaultId();
      }
      return id;
    }
  );
};
