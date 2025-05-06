import { primaryLanguage } from '@core/ui/i18n/Language'
import { languageQueryKey } from '@core/ui/query/keys'
import {
  GetLanguageFunction,
  SetLanguageFunction,
} from '@core/ui/storage/CoreStorage'

import { getPersistentState } from '../state/persistent/getPersistentState'
import { setPersistentState } from '../state/persistent/setPersistentState'

const [key] = languageQueryKey

export const getLanguage: GetLanguageFunction = async () => {
  return getPersistentState(key, primaryLanguage)
}

export const setLanguage: SetLanguageFunction = async language => {
  await setPersistentState(key, language)
}
