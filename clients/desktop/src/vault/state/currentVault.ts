import { groupItems } from '@lib/utils/array/groupItems';
import { withoutDuplicates } from '@lib/utils/array/withoutDuplicates';
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent';
import { useMemo } from 'react';

import { storage } from '../../../wailsjs/go/models';
import { areEqualCoins, CoinKey } from '../../coin/Coin';
import { getStorageCoinKey } from '../../coin/utils/storageCoin';
import { getValueProviderSetup } from '../../lib/ui/state/getValueProviderSetup';
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

export const useCurrentVaultAddress = (chain: string) => {
  const addresses = useCurrentVaultAddreses();

  return shouldBePresent(addresses[chain as Chain]);
};

export const useCurrentVaultChainCoins = (chain: string) => {
  const coins = useCurrentVaultCoins();

  return useMemo(
    () => coins.filter(coin => coin.chain === chain),
    [chain, coins]
  );
};

export const useCurrentVaultNativeCoin = (chain: string) => {
  const nativeCoins = useCurrentVaultNativeCoins();

  return shouldBePresent(nativeCoins.find(coin => coin.chain === chain));
};

export const useCurrentVaultCoin = (coinKey: CoinKey) => {
  const coins = useCurrentVaultCoins();

  return shouldBePresent(
    coins.find(coin => areEqualCoins(getStorageCoinKey(coin), coinKey))
  );
};

export const useVaultServerStatus = () => {
  const { signers, local_party_id } = useCurrentVault();

  return useMemo(() => {
    const hasServerSigner = haveServerSigner(signers);
    const isBackupServerShare = local_party_id
      ?.toLowerCase()
      .startsWith('server-');

    return {
      hasServer: hasServerSigner && !isBackupServerShare,
      isBackup: isBackupServerShare,
    };
  }, [signers, local_party_id]);
};
