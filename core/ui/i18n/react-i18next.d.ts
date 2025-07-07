import 'react-i18next'
import 'i18next'

import { translations } from './translations'

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation'
    resources: {
      translation: typeof translations.en
    }
    keySeparator: '.'
    nsSeparator: false
  }
}

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation'
    resources: {
      translation: typeof translations.en
    }
    keySeparator: '.'
    nsSeparator: false
  }
}
