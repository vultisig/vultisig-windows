import { StorageKey } from '@core/ui/storage/StorageKey'
import {
  isTonW5InitiallyEnabled,
  TonW5EnabledStorage,
} from '@core/ui/storage/tonW5Enabled'

import { persistentStorage } from '../state/persistentState'

export const tonW5EnabledStorage: TonW5EnabledStorage = {
  getIsTonW5Enabled: async () => {
    const value = persistentStorage.getItem<boolean>(StorageKey.isTonW5Enabled)

    if (value === undefined) {
      return isTonW5InitiallyEnabled
    }

    return value
  },
  setIsTonW5Enabled: async isTonW5Enabled => {
    persistentStorage.setItem(StorageKey.isTonW5Enabled, isTonW5Enabled)
  },
}
