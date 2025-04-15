import { PersistentStateKey } from '@clients/extension/src/state/persistent/PersistentStateKey'
import { usePersistentStateMutation } from '@clients/extension/src/state/persistent/usePersistentStateMutation'
import { usePersistentStateQuery } from '@clients/extension/src/state/persistent/usePersistentStateQuery'
import { Language, primaryLanguage } from '@core/ui/i18n/Language'

export const useLanguageQuery = () => {
  return usePersistentStateQuery<Language>(
    PersistentStateKey.Language,
    primaryLanguage
  )
}

export const useLanguageMutation = () => {
  return usePersistentStateMutation<Language>(PersistentStateKey.Language)
}
