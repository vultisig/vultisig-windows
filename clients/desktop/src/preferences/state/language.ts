import { Language, primaryLanguage } from '@core/ui/i18n/Language'
import { PersistentStateKey } from '@core/ui/state/PersistentStateKey'

import { usePersistentState } from '../../state/persistentState'

export const useLanguage = () => {
  return usePersistentState<Language>(
    PersistentStateKey.Language,
    primaryLanguage
  )
}
