import { StorageKey } from '@core/ui/storage/StorageKey'
import {
  isTssBatchingInitiallyEnabled,
  TssBatchingEnabledStorage,
} from '@core/ui/storage/tssBatchingEnabled'

import { persistentStorage } from '../state/persistentState'

export const tssBatchingEnabledStorage: TssBatchingEnabledStorage = {
  getIsTssBatchingEnabled: async () => {
    const value = persistentStorage.getItem<boolean>(
      StorageKey.isTssBatchingEnabled
    )

    if (value === undefined) {
      return isTssBatchingInitiallyEnabled
    }

    return value
  },
  setIsTssBatchingEnabled: async isTssBatchingEnabled => {
    persistentStorage.setItem(
      StorageKey.isTssBatchingEnabled,
      isTssBatchingEnabled
    )
  },
}
