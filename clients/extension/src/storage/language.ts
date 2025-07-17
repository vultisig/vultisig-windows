import { primaryLanguage } from '@core/ui/i18n/Language'
import { LanguageStorage } from '@core/ui/storage/language'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { getPersistentState } from '@lib/ui/state/persistent/getPersistentState'
import { setPersistentState } from '@lib/ui/state/persistent/setPersistentState'

export const languageStorage: LanguageStorage = {
  getLanguage: async () => {
    return getPersistentState(StorageKey.language, primaryLanguage)
  },
  setLanguage: async language => {
    await setPersistentState(StorageKey.language, language)
  },
}
