import {
  BlockaidStorage,
  isBlockaidInitiallyEnabled,
} from '@core/ui/storage/blockaid'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'

export const blockaidStorage: BlockaidStorage = {
  getIsBlockaidEnabled: async () => {
    return getStorageValue(
      StorageKey.isBlockaidEnabled,
      isBlockaidInitiallyEnabled
    )
  },
  setIsBlockaidEnabled: async isBlockaidEnabled => {
    await setStorageValue(StorageKey.isBlockaidEnabled, isBlockaidEnabled)
  },
}
