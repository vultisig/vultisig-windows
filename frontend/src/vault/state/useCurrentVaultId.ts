import { useCallback } from 'react';

import { useStateCorrector } from '../../lib/ui/state/useStateCorrector';
import { isEmpty } from '../../lib/utils/array/isEmpty';
import {
  PersistentStateKey,
  usePersistentState,
} from '../../state/persistentState';
import { useVaults } from '../queries/useVaultsQuery';
import { getStorageVaultId } from '../utils/storageVault';

export const useCurrentVaultId = () => {
  const vaults = useVaults();

  const getInitialVaultId = useCallback(() => {
    if (isEmpty(vaults)) return null;

    return getStorageVaultId(vaults[0]);
  }, [vaults]);

  return useStateCorrector(
    usePersistentState<string | null>(
      PersistentStateKey.CurrentVaultId,
      getInitialVaultId
    ),
    id => {
      const vault = vaults.find(vault => getStorageVaultId(vault) === id);
      if (!vault) {
        return getInitialVaultId();
      }
      return id;
    }
  );
};
