import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { VaultService } from '../../services/Vault/VaultService';
import { mapLanguageToLanguageNameUI } from '../mappers/mapLanguageToLanguageUI';

export const vaultSettingsQueryKey = ['vaultSettings'];

const DEFAULT_SETTINGS = {
  currency: 'USD',
  language: 'en',
  defaultChains: [],
  languageUI: 'English',
};

export const useVaultSettingsQuery = () => {
  const vaultService = new VaultService();
  const { t } = useTranslation();

  return useQuery({
    queryKey: [vaultSettingsQueryKey],
    queryFn: async () => {
      const data = await vaultService.getVaultSettings();
      const currency = data?.[0]?.currency;
      const language = data?.[0]?.language;
      const defaultChains = data?.[0]?.default_chains;

      return {
        currency,
        language,
        defaultChains,
        languageUI: t(mapLanguageToLanguageNameUI(language) || ''),
      };
    },
    staleTime: 1000,
    initialData: DEFAULT_SETTINGS,
  });
};
