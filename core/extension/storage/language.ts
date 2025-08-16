import { primaryLanguage } from '@core/ui/i18n/Language'
import { LanguageStorage } from '@core/ui/storage/language'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'

export const languageStorage: LanguageStorage = {
  getLanguage: async () => {
    return getStorageValue(StorageKey.language, primaryLanguage)
  },
  setLanguage: async language => {
    await setStorageValue(StorageKey.language, language)
  },
}
