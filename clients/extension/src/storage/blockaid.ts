import { isBlockaidInitiallyEnabled } from '@core/ui/storage/blockaid'
import { BlockaidStorage } from '@core/ui/storage/blockaid'
import { StorageKey } from '@core/ui/storage/StorageKey'

import { getPersistentState } from '../state/persistent/getPersistentState'
import { setPersistentState } from '../state/persistent/setPersistentState'

export const blockaidStorage: BlockaidStorage = {
  getBlockaidEnabled: () =>
    getPersistentState(StorageKey.blockaidEnabled, isBlockaidInitiallyEnabled),
  setBlockaidEnabled: async value => {
    await setPersistentState(StorageKey.blockaidEnabled, value)
  },
}
