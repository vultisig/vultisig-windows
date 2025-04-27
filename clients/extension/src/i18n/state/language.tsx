import { usePersistentStateMutation } from '@clients/extension/src/state/persistent/usePersistentStateMutation'
import { usePersistentStateQuery } from '@clients/extension/src/state/persistent/usePersistentStateQuery'
import { Language, primaryLanguage } from '@core/ui/i18n/Language'
import { PersistentStateKey } from '@core/ui/state/PersistentStateKey'

export const useLanguageQuery = () => {
  return usePersistentStateQuery<Language>(
    PersistentStateKey.Language,
    primaryLanguage
  )
}

export const useLanguageMutation = () => {
  return usePersistentStateMutation<Language>(PersistentStateKey.Language)
}
