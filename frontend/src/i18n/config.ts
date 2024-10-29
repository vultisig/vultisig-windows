import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

import { de } from './locales/de';
import { en } from './locales/en';
import { es } from './locales/es';
import { hr } from './locales/hr';
import { it } from './locales/it';
import { pt } from './locales/pt';

// Initialization
i18n
  .use(Backend)
  .use(LanguageDetector) // Detects the user's language
  .use(initReactI18next) // Passes i18n instance to react-i18next
  .init({
    resources: {
      en: {
        translation: en,
      },
      es: {
        translation: es,
      },
      pt: {
        translation: pt,
      },
      it: {
        translation: it,
      },
      de: {
        translation: de,
      },
      hr: {
        translation: hr,
      },
    },
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
