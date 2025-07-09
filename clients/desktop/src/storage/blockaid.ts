import { isBlockaidInitiallyEnabled } from '@core/ui/storage/blockaid'
import { BlockaidStorage } from '@core/ui/storage/blockaid'
import { StorageKey } from '@core/ui/storage/StorageKey'

import { persistentStorage } from '../state/persistentState'

export const blockaidStorage: BlockaidStorage = {
  getBlockaidEnabled: async () => {
    const value = persistentStorage.getItem<boolean>(StorageKey.blockaidEnabled)

    if (value === undefined) {
      return isBlockaidInitiallyEnabled
    }

    return value
  },
  setBlockaidEnabled: async (enabled: boolean) => {
    persistentStorage.setItem(StorageKey.blockaidEnabled, enabled)
  },
}
