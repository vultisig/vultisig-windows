import {
  BlockaidStorage,
  isBlockaidInitiallyEnabled,
} from '@core/ui/storage/blockaid'
import { StorageKey } from '@core/ui/storage/StorageKey'

import { getPersistentState } from '../state/persistent/getPersistentState'
import { setPersistentState } from '../state/persistent/setPersistentState'

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
