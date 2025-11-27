import { Chain } from '@core/chain/Chain'
import {
  DefiChainsStorage,
  initialDefiChains,
} from '@core/ui/storage/defiChains'
import { StorageKey } from '@core/ui/storage/StorageKey'

import { persistentStorage } from '../state/persistentState'

export const defiChainsStorage: DefiChainsStorage = {
  getDefiChains: async () => {
    const value = persistentStorage.getItem<Chain[]>(StorageKey.defiChains)

    if (value === undefined) {
      return initialDefiChains
    }

    return value
  },
  setDefiChains: async (chains: Chain[]) => {
    persistentStorage.setItem(StorageKey.defiChains, chains)
  },
}
