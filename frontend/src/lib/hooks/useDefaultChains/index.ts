import { useUpdateVaultSettingsMutation } from '../../../vault/mutations/useUpdateVaultSettings';
import { useVaultSettingsQuery } from '../../../vault/queries/useVaultSettingsQuery';

export const useDefaultChains = () => {
  const { data } = useVaultSettingsQuery();

  const {
    mutate: updateSettings,
    isPending: isUpdating,
    error,
  } = useUpdateVaultSettingsMutation();

  const updateDefaultChains = (newDefaultChains: string[]) => {
    updateSettings({ ...data, defaultChains: newDefaultChains });
  };

  return {
    defaultChains: data?.defaultChains || [],
    updateDefaultChains,
    isUpdating,
    error,
  };
};
