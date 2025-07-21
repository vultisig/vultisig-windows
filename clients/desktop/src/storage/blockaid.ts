import {
  BlockaidStorage,
  isBlockaidInitiallyEnabled,
} from '@core/ui/storage/blockaid'
import { StorageKey } from '@core/ui/storage/StorageKey'

import { persistentStorage } from '../state/persistentState'

export const blockaidStorage: BlockaidStorage = {
  getIsBlockaidEnabled: async () => {
    const value = persistentStorage.getItem<boolean>(
      StorageKey.isBlockaidEnabled
    )

    if (value === undefined) {
      return isBlockaidInitiallyEnabled
    }

    return value
  },
  setIsBlockaidEnabled: async isBlockaidEnabled => {
    persistentStorage.setItem(StorageKey.isBlockaidEnabled, isBlockaidEnabled)
  },
}
