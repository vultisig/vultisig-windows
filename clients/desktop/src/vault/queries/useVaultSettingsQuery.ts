import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { GetSettings } from '../../../wailsjs/go/storage/Store';
import { mapLanguageToLanguageNameUI } from '../mappers/mapLanguageToLanguageUI';

export const vaultSettingsQueryKey = ['vaultSettings'];

const DEFAULT_SETTINGS = {
  currency: 'USD',
  language: 'en',
  languageUI: 'English',
};

export const useVaultSettingsQuery = () => {
  const { t } = useTranslation();

  return useQuery({
    queryKey: [vaultSettingsQueryKey],
    queryFn: async () => {
      const data = await GetSettings();
      const currency = data?.[0]?.currency;
      const language = data?.[0]?.language;

      return {
        currency,
        language,
        languageUI: t(mapLanguageToLanguageNameUI(language) || ''),
      };
    },
    staleTime: 1000,
    initialData: DEFAULT_SETTINGS,
  });
};
