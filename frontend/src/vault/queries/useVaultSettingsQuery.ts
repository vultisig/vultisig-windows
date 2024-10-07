import { useQuery } from '@tanstack/react-query';

import { useAssertWalletCore } from '../../providers/WalletCoreProvider';
import { VaultServiceFactory } from '../../services/Vault/VaultServiceFactory';

export const vaultSettingsQueryKey = ['vaultSettings'];

const DEFAULT_SETTINGS = {
  currency: 'USD',
  language: 'en',
  defaultChains: [],
};

export const useVaultSettingsQuery = () => {
  const walletCore = useAssertWalletCore();
  const vaultService = VaultServiceFactory.getService(walletCore);

  return useQuery({
    queryKey: [vaultSettingsQueryKey],
    queryFn: async () => {
      const data = await vaultService.getVaultSettings();
      const currency = data?.[0]?.currency;
      const language = data?.[0]?.language;
      const defaultChains = data?.[0]?.default_chains;

      return { currency, language, defaultChains };
    },
    staleTime: 1000,
    initialData: DEFAULT_SETTINGS,
  });
};
