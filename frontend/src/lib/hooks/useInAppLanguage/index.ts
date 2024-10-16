import i18n from '../../../i18n/config';
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
    i18n.changeLanguage(newLanguage);
  };

  return {
    language: data?.language,
    updateInAppLanguage,
    isUpdating,
    error,
  };
};
