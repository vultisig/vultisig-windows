import { Language, primaryLanguage } from '@core/ui/i18n/Language'
import { LanguageStorage } from '@core/ui/storage/language'
import { StorageKey } from '@core/ui/storage/StorageKey'

import { persistentStorage } from '../state/persistentState'

export const languageStorage: LanguageStorage = {
  getLanguage: async () => {
    const value = persistentStorage.getItem<Language>(StorageKey.language)

    if (value === undefined) {
      return primaryLanguage
    }

    return value
  },
  setLanguage: async language => {
    persistentStorage.setItem(StorageKey.language, language)
  },
}
