import { Chain } from '@core/chain/Chain'
import {
  DefaultChainsStorage,
  initialDefaultChains,
} from '@core/ui/storage/defaultChains'
import { StorageKey } from '@core/ui/storage/StorageKey'

import { persistentStorage } from '../state/persistentState'

export const defaultChainsStorage: DefaultChainsStorage = {
  getDefaultChains: async () => {
    const value = persistentStorage.getItem<Chain[]>(StorageKey.defaultChains)

    if (value === undefined) {
      return initialDefaultChains
    }

    return value
  },
}
