import { useUpdateVaultSettingsMutation } from '../../../vault/mutations/useUpdateVaultSettings';
import { useVaultSettingsQuery } from '../../../vault/queries/useVaultSettingsQuery';

export const useInAppLanguage = () => {
  const { data } = useVaultSettingsQuery();

  const {
    mutate: updateSettings,
    isPending: isUpdating,
    error,
  } = useUpdateVaultSettingsMutation();

  const updateInAppLanguage = (newLanguage: string) => {
    updateSettings({ ...data, language: newLanguage });
  };

  return {
    language: data?.language,
    updateInAppLanguage,
    isUpdating,
    error,
  };
};
