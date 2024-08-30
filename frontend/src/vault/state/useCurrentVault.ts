import { useMemo } from 'react';
import { useVaults } from '../queries/useVaultsQuery';
import { useCurrentVaultId } from './useCurrentVaultId';
import { getVaultId } from '../utils/getVaultId';
import { shouldBePresent } from '../../lib/utils/assert/shouldBePresent';

export const useCurrentVault = () => {
  const vaults = useVaults();
  const [currentVaultId] = useCurrentVaultId();

  return useMemo(() => {
    if (!currentVaultId) return null;

    const vault = shouldBePresent(
      vaults.find(vault => getVaultId(vault) === currentVaultId)
    );

    return vault;
  }, [vaults, currentVaultId]);
};

export const useAssertCurrentVault = () => {
  return shouldBePresent(useCurrentVault());
};
