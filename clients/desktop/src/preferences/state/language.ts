import { Language, primaryLanguage } from '@core/ui/i18n/Language'

import {
  PersistentStateKey,
  usePersistentState,
} from '../../state/persistentState'

export const useLanguage = () => {
  return usePersistentState<Language>(
    PersistentStateKey.Language,
    primaryLanguage
  )
}
