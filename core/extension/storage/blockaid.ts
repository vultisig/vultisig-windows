import { getPersistentState } from '@core/extension/state/persistent/getPersistentState'
import { setPersistentState } from '@core/extension/state/persistent/setPersistentState'
import {
  BlockaidStorage,
  isBlockaidInitiallyEnabled,
} from '@core/ui/storage/blockaid'
import { StorageKey } from '@core/ui/storage/StorageKey'

export const blockaidStorage: BlockaidStorage = {
  getIsBlockaidEnabled: async () => {
    return getPersistentState(
      StorageKey.isBlockaidEnabled,
      isBlockaidInitiallyEnabled
    )
  },
  setIsBlockaidEnabled: async isBlockaidEnabled => {
    await setPersistentState(StorageKey.isBlockaidEnabled, isBlockaidEnabled)
  },
}
