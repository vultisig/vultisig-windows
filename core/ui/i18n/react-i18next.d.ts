import 'react-i18next'
import 'i18next'

import { translations } from './translations'

// Simple declaration using the English translations as the type source
declare module 'i18next' {
  interface CustomTypeOptions {
    resources: {
      translation: typeof translations.en
    }
  }
}
