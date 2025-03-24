import { Language, primaryLanguage } from '@core/ui/i18n/Language'

import { PersistentStateKey } from '../../state/persistent/PersistentStateKey'
import { usePersistentStateMutation } from '../../state/persistent/usePersistentStateMutation'
import { usePersistentStateQuery } from '../../state/persistent/usePersistentStateQuery'

export const useLanguageQuery = () => {
  return usePersistentStateQuery<Language>(
    PersistentStateKey.Language,
    primaryLanguage
  )
}

export const useLanguageMutation = () => {
  return usePersistentStateMutation<Language>(PersistentStateKey.Language)
}
