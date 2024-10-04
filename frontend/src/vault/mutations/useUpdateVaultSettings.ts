import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Settings } from '../../lib/types/settings';
import { useAssertWalletCore } from '../../providers/WalletCoreProvider';
import { VaultServiceFactory } from '../../services/Vault/VaultServiceFactory';
import { vaultSettingsQueryKey } from '../queries/useVaultSettingsQuery';

export const useUpdateVaultSettingsMutation = () => {
  const walletCore = useAssertWalletCore();
  const vaultService = VaultServiceFactory.getService(walletCore);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Settings) => {
      console.log('## updated settings', settings);
      const result = await vaultService.updateVaultSettings({
        currency: settings.currency,
        language: settings.language,
        default_chains: settings.defaultChains,
      });

      console.log('## result', result);

      return result;
    },
    onSuccess: () => {
      console.log('## is success');
      queryClient.invalidateQueries({
        queryKey: [vaultSettingsQueryKey],
      });
    },
  });
};
