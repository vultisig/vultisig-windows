import { primaryLanguage } from '@core/ui/i18n/Language'
import {
  GetLanguageFunction,
  SetLanguageFunction,
} from '@core/ui/storage/CoreStorage'
import { StorageKey } from '@core/ui/storage/StorageKey'

import { getPersistentState } from '../state/persistent/getPersistentState'
import { setPersistentState } from '../state/persistent/setPersistentState'

export const getLanguage: GetLanguageFunction = async () => {
  return getPersistentState(StorageKey.language, primaryLanguage)
}

export const setLanguage: SetLanguageFunction = async language => {
  await setPersistentState(StorageKey.language, language)
}
