import { recordMap } from '@lib/utils/record/recordMap'
import i18n from 'i18next'
import Backend from 'i18next-http-backend'
import { initReactI18next } from 'react-i18next'

import { primaryLanguage } from './Language'
import { translations } from './translations'

const i18nInstance = i18n.use(Backend).use(initReactI18next)

i18nInstance.init({
  resources: recordMap(translations, translation => ({ translation })),
  fallbackLng: primaryLanguage,
  debug: false,
  interpolation: {
    escapeValue: false,
  },
  returnNull: false,
  returnEmptyString: false,
  parseMissingKeyHandler: key => {
    console.warn(`Missing translation key: ${key}`)
    return key
  },
})

export default i18nInstance
