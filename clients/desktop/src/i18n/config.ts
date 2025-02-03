import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

import { recordMap } from '@lib/utils/record/recordMap';
import { primaryLanguage } from './Language';
import { translations } from './translations';

// Initialization
i18n
  .use(Backend)
  .use(LanguageDetector) // Detects the user's language
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
