import { useMutation, useQueryClient } from '@tanstack/react-query';

import { SaveSettings } from '../../../wailsjs/go/storage/Store';
import { Settings } from '../../lib/types/settings';
import { vaultSettingsQueryKey } from '../queries/useVaultSettingsQuery';

export const useUpdateVaultSettingsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Settings) => {
      const result = await SaveSettings({
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
