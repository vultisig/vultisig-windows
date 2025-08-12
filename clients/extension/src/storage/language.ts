import { getPersistentState } from '@core/extension/state/persistent/getPersistentState'
import { setPersistentState } from '@core/extension/state/persistent/setPersistentState'
import { primaryLanguage } from '@core/ui/i18n/Language'
import { LanguageStorage } from '@core/ui/storage/language'
import { StorageKey } from '@core/ui/storage/StorageKey'

export const languageStorage: LanguageStorage = {
  getLanguage: async () => {
    return getPersistentState(StorageKey.language, primaryLanguage)
  },
  setLanguage: async language => {
    await setPersistentState(StorageKey.language, language)
  },
}
