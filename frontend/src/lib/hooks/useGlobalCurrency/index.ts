import { Fiat } from '../../../model/fiat';
import { useUpdateVaultSettingsMutation } from '../../../vault/mutations/useUpdateVaultSettings';
import { useVaultSettingsQuery } from '../../../vault/queries/useVaultSettingsQuery';

export const useGlobalCurrency = () => {
  const { data } = useVaultSettingsQuery();

  const {
    mutate: updateSettings,
    isPending: isUpdating,
    error,
  } = useUpdateVaultSettingsMutation();

  const updateGlobalCurrency = (newCurrency: Fiat) => {
    updateSettings({ ...data, currency: newCurrency });
  };

  return {
    globalCurrency: data.currency as Fiat,
    updateGlobalCurrency,
    isUpdating,
    error,
  };
};
