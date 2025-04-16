import { PersistentStateKey } from '@clients/extension/src/state/persistent/PersistentStateKey'
import { usePersistentStateMutation } from '@clients/extension/src/state/persistent/usePersistentStateMutation'
import { usePersistentStateQuery } from '@clients/extension/src/state/persistent/usePersistentStateQuery'
import { Language, primaryLanguage } from '@core/ui/i18n/Language'

const queryKey: PersistentStateKey = ['language']

export const useLanguageQuery = () => {
  return usePersistentStateQuery<Language>(queryKey, primaryLanguage)
}

export const useLanguageMutation = () => {
  return usePersistentStateMutation<Language>(queryKey)
}
