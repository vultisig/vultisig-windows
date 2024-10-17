import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';
import { initReactI18next } from 'react-i18next';

import deTranslation from './locales/de/translation.json';
import enTranslation from './locales/en/translation.json';
import esTranslation from './locales/es/translation.json';
import hrTranslation from './locales/hr/translation.json';
import itTranslation from './locales/it/translation.json';
import ptTranslation from './locales/pt/translation.json';

// Initialization
i18n
  .use(Backend)
  .use(LanguageDetector) // Detects the user's language
  .use(initReactI18next) // Passes i18n instance to react-i18next
  .init({
    resources: {
      en: {
        translation: enTranslation,
      },
      es: {
        translation: esTranslation,
      },
      pt: {
        translation: ptTranslation,
      },
      it: {
        translation: itTranslation,
      },
      de: {
        translation: deTranslation,
      },
      hr: {
        translation: hrTranslation,
      },
    },
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
