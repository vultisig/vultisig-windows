import { useMemo } from 'react';

import { storage } from '../../../wailsjs/go/models';
import { areEqualCoins, CoinKey } from '../../coin/Coin';
import { getStorageCoinKey } from '../../coin/utils/storageCoin';
import { getValueProviderSetup } from '../../lib/ui/state/getValueProviderSetup';
import { groupItems } from '../../lib/utils/array/groupItems';
import { withoutDuplicates } from '../../lib/utils/array/withoutDuplicates';
import { shouldBePresent } from '../../lib/utils/assert/shouldBePresent';
import { Chain } from '../../model/chain';
import { haveServerSigner } from '../fast/utils/haveServerSigner';

export const { useValue: useCurrentVault, provider: CurrentVaultProvider } =
  getValueProviderSetup<storage.Vault>('CurrentVault');

export const useCurrentVaultNativeCoins = () => {
  const vault = useCurrentVault();

  return useMemo(
    () => (vault.coins || []).filter(coin => coin.is_native_token),
    [vault.coins]
  );
};

export const useCurrentVaultChainIds = () => {
  const coins = useCurrentVaultNativeCoins();

  return useMemo(
    () => withoutDuplicates(coins.map(coin => coin.chain)),
    [coins]
  );
};

export const useCurrentVaultCoins = () => {
  const chains = useCurrentVaultChainIds();

  const vault = useCurrentVault();

  return useMemo(
    () => (vault.coins || []).filter(coin => chains.includes(coin.chain)),
    [chains, vault.coins]
  );
};

export const useCurrentVaultCoinsByChain = () => {
  const coins = useCurrentVaultCoins();

  return useMemo(() => {
    return groupItems(coins, coin => coin.chain as Chain);
  }, [coins]);
};

export const useCurrentVaultAddreses = () => {
  const coins = useCurrentVaultNativeCoins();

  return useMemo(() => {
    return Object.fromEntries(
      coins.map(coin => [coin.chain, coin.address])
    ) as Record<Chain, string>;
  }, [coins]);
};

export const useCurrentVaultAddress = (chainId: string) => {
  const addresses = useCurrentVaultAddreses();

  return shouldBePresent(addresses[chainId as Chain]);
};

export const useCurrentVaultChainCoins = (chainId: string) => {
  const coins = useCurrentVaultCoins();

  return useMemo(
    () => coins.filter(coin => coin.chain === chainId),
    [chainId, coins]
  );
};

export const useCurrentVaultNativeCoin = (chainId: string) => {
  const nativeCoins = useCurrentVaultNativeCoins();

  return shouldBePresent(nativeCoins.find(coin => coin.chain === chainId));
};

export const useCurrentVaultCoin = (coinKey: CoinKey) => {
  const coins = useCurrentVaultCoins();

  return shouldBePresent(
    coins.find(coin => areEqualCoins(getStorageCoinKey(coin), coinKey))
  );
};

export const useCurrentVaultHasServer = () => {
  const { signers } = useCurrentVault();

  return useMemo(() => haveServerSigner(signers), [signers]);
};
