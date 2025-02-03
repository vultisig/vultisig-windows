import { useMutation, useQueryClient } from '@tanstack/react-query';

import { Settings } from '../../lib/types/settings';
import { VaultService } from '../../services/Vault/VaultService';
import { vaultSettingsQueryKey } from '../queries/useVaultSettingsQuery';

export const useUpdateVaultSettingsMutation = () => {
  const vaultService = new VaultService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Settings) => {
      const result = await vaultService.updateVaultSettings({
        currency: settings.currency,
        language: settings.language,
      });

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [vaultSettingsQueryKey],
      });
    },
  });
};
