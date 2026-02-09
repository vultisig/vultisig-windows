import { AppView } from '@clients/extension/src/navigation/AppView'
import { getStorageValue } from '@lib/extension/storage/get'
import { removeStorageValue } from '@lib/extension/storage/remove'
import { setStorageValue } from '@lib/extension/storage/set'

const persistedViewKey = 'persistedView'

export const getPersistedHistory = async () =>
  getStorageValue<AppView[] | null>(persistedViewKey, null)

export const setPersistedHistory = async (history: AppView[]) =>
  setStorageValue(persistedViewKey, history)

export const removePersistedHistory = async () =>
  removeStorageValue(persistedViewKey)
