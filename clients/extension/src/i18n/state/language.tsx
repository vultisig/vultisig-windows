import { usePersistentStateMutation } from '@clients/extension/src/state/persistent/usePersistentStateMutation'
import { usePersistentStateQuery } from '@clients/extension/src/state/persistent/usePersistentStateQuery'
import { Language, primaryLanguage } from '@core/ui/i18n/Language'
import { languageQueryKey } from '@core/ui/query/keys'

const [key] = languageQueryKey

export const useLanguageQuery = () => {
  return usePersistentStateQuery<Language>(key, primaryLanguage)
}

export const useLanguageMutation = () => {
  return usePersistentStateMutation<Language>(key)
}
