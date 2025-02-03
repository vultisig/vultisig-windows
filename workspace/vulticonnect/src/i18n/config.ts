import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import { Language } from "utils/constants";

import enTranslation from "i18n/locales/en_UK";
import esTranslation from "i18n/locales/es_ES";
import nlTranslation from "i18n/locales/nl_NL";
import hrTranslation from "i18n/locales/hr_HR";
import deTranslation from "i18n/locales/de_DE";
import itTranslation from "i18n/locales/it_IT";
import ruTranslation from "i18n/locales/ru_RU";
import ptTranslation from "i18n/locales/pt_PT";

i18n.use(initReactI18next).init({
  resources: {
    [Language.CROATIA]: {
      translation: hrTranslation,
    },
    [Language.DUTCH]: {
      translation: nlTranslation,
    },
    [Language.ENGLISH]: {
      translation: enTranslation,
    },
    [Language.GERMAN]: {
      translation: deTranslation,
    },
    [Language.ITALIAN]: {
      translation: itTranslation,
    },
    [Language.RUSSIAN]: {
      translation: ruTranslation,
    },
    [Language.PORTUGUESE]: {
      translation: ptTranslation,
    },
    [Language.SPANISH]: {
      translation: esTranslation,
    },
  },
  fallbackLng: "en",
  debug: false,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
