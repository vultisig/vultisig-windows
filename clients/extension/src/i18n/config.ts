import deTranslation from '@clients/extension/src/i18n/locales/de_DE'
import enTranslation from '@clients/extension/src/i18n/locales/en_UK'
import esTranslation from '@clients/extension/src/i18n/locales/es_ES'
import hrTranslation from '@clients/extension/src/i18n/locales/hr_HR'
import itTranslation from '@clients/extension/src/i18n/locales/it_IT'
import nlTranslation from '@clients/extension/src/i18n/locales/nl_NL'
import ptTranslation from '@clients/extension/src/i18n/locales/pt_PT'
import ruTranslation from '@clients/extension/src/i18n/locales/ru_RU'
import { Language } from '@clients/extension/src/utils/constants'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

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
  fallbackLng: 'en',
  debug: false,
  interpolation: {
    escapeValue: false,
  },
})

export default i18n
