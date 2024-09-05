import { useMemo } from 'react';
import { useVaults } from '../queries/useVaultsQuery';
import { useCurrentVaultId } from './useCurrentVaultId';
import { getVaultId } from '../utils/getVaultId';
import { shouldBePresent } from '../../lib/utils/assert/shouldBePresent';
import { withoutDuplicates } from '../../lib/utils/array/withoutDuplicates';

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

export const useAssertCurrentVaultCoins = () => {
  const vault = useAssertCurrentVault();

  return vault.coins || [];
};

export const useAsserCurrentVaultChainCoins = (chainId: string) => {
  const coins = useAssertCurrentVaultCoins();

  return useMemo(() => coins.filter(coin => coin.chain === chainId), [coins]);
};

export const useAssertCurrentVaultChainIds = () => {
  const coins = useAssertCurrentVaultCoins();

  return useMemo(
    () => withoutDuplicates(coins.map(coin => coin.chain)),
    [coins]
  );
};
