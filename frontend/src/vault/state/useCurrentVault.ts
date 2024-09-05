import { useMemo } from 'react';
import { useVaults } from '../queries/useVaultsQuery';
import { useCurrentVaultId } from './useCurrentVaultId';
import { shouldBePresent } from '../../lib/utils/assert/shouldBePresent';
import { withoutDuplicates } from '../../lib/utils/array/withoutDuplicates';
import { getStorageVaultId } from '../utils/storageVault';

export const useCurrentVault = () => {
  const vaults = useVaults();
  const [currentVaultId] = useCurrentVaultId();

  return useMemo(() => {
    if (!currentVaultId) return null;

    const vault = shouldBePresent(
      vaults.find(vault => getStorageVaultId(vault) === currentVaultId)
    );

    return vault;
  }, [vaults, currentVaultId]);
};

export const useAssertCurrentVault = () => {
  return shouldBePresent(useCurrentVault());
};

export const useAssertCurrentVaultChainIds = () => {
  const vault = useAssertCurrentVault();

  const coins = vault.coins || [];

  return useMemo(
    () =>
      withoutDuplicates(
        coins.filter(coin => coin.is_native_token).map(coin => coin.chain)
      ),
    [coins]
  );
};

export const useAssertCurrentVaultCoins = () => {
  const chains = useAssertCurrentVaultChainIds();

  const vault = useAssertCurrentVault();

  const allCoins = vault.coins || [];

  return useMemo(
    () => allCoins.filter(coin => chains.includes(coin.chain)),
    [allCoins, chains]
  );
};

export const useAsserCurrentVaultChainCoins = (chainId: string) => {
  const coins = useAssertCurrentVaultCoins();

  return useMemo(() => coins.filter(coin => coin.chain === chainId), [coins]);
};
