import { Language, primaryLanguage } from '../i18n/Language'
import { PersistentStateKey, usePersistentState } from './usePersistenStorage'

export const useAppLanguage = () => {
  return usePersistentState<Language>(
    PersistentStateKey.Language,
    primaryLanguage
  )
}
