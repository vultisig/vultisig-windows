import { recordMap } from '@lib/utils/record/recordMap';
import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

import { primaryLanguage } from './Language';
import { translations } from './translations';

// Initialization
i18n
  .use(Backend)
  .use(initReactI18next) // Passes i18n instance to react-i18next
  .init({
    resources: recordMap(translations, translation => ({ translation })),
    fallbackLng: primaryLanguage,
    debug: false,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
