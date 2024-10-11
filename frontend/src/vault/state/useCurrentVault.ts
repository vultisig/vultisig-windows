import { useMemo } from 'react';

import { areEqualCoins, CoinKey } from '../../coin/Coin';
import { getStorageCoinKey } from '../../coin/utils/storageCoin';
import { groupItems } from '../../lib/utils/array/groupItems';
import { withoutDuplicates } from '../../lib/utils/array/withoutDuplicates';
import { shouldBePresent } from '../../lib/utils/assert/shouldBePresent';
import { Chain } from '../../model/chain';
import { useVaults } from '../queries/useVaultsQuery';
import { getStorageVaultId } from '../utils/storageVault';
import { useCurrentVaultId } from './useCurrentVaultId';

export const useUnassertedCurrentVault = () => {
  const vaults = useVaults();
  const [currentVaultId] = useCurrentVaultId();

  return useMemo(() => {
    if (!currentVaultId) return null;

    const vault = vaults.find(
      vault => getStorageVaultId(vault) === currentVaultId
    );

    return vault;
  }, [vaults, currentVaultId]);
};

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

export const useAssertCurrentVaultNativeCoins = () => {
  const vault = useAssertCurrentVault();

  return useMemo(
    () => (vault.coins || []).filter(coin => coin.is_native_token),
    [vault.coins]
  );
};

export const useAssertCurrentVaultChainIds = () => {
  const coins = useAssertCurrentVaultNativeCoins();

  return useMemo(
    () => withoutDuplicates(coins.map(coin => coin.chain)),
    [coins]
  );
};

export const useAssertCurrentVaultCoins = () => {
  const chains = useAssertCurrentVaultChainIds();

  const vault = useAssertCurrentVault();

  return useMemo(
    () => (vault.coins || []).filter(coin => chains.includes(coin.chain)),
    [chains, vault.coins]
  );
};

export const useAssertCurrentVaultCoinsByChain = () => {
  const coins = useAssertCurrentVaultCoins();

  return useMemo(() => {
    return groupItems(coins, coin => coin.chain as Chain);
  }, [coins]);
};

export const useAssertCurrentVaultAddreses = () => {
  const coins = useAssertCurrentVaultNativeCoins();

  return useMemo(() => {
    return Object.fromEntries(
      coins.map(coin => [coin.chain, coin.address])
    ) as Record<Chain, string>;
  }, [coins]);
};

export const useAssertCurrentVaultAddress = (chainId: string) => {
  const addresses = useAssertCurrentVaultAddreses();

  return shouldBePresent(addresses[chainId as Chain]);
};

export const useAssertCurrentVaultChainCoins = (chainId: string) => {
  const coins = useAssertCurrentVaultCoins();

  return useMemo(
    () => coins.filter(coin => coin.chain === chainId),
    [chainId, coins]
  );
};

export const useAssertCurrentVaultNativeCoin = (chainId: string) => {
  const nativeCoins = useAssertCurrentVaultNativeCoins();

  return shouldBePresent(nativeCoins.find(coin => coin.chain === chainId));
};

export const useAssertCurrentVaultCoin = (coinKey: CoinKey) => {
  const coins = useAssertCurrentVaultCoins();

  return shouldBePresent(
    coins.find(coin => areEqualCoins(getStorageCoinKey(coin), coinKey))
  );
};
