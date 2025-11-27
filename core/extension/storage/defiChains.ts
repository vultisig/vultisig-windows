import { Chain } from '@core/chain/Chain'
import {
  DefiChainsStorage,
  initialDefiChains,
} from '@core/ui/storage/defiChains'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'

export const defiChainsStorage: DefiChainsStorage = {
  getDefiChains: async () =>
    getStorageValue(StorageKey.defiChains, initialDefiChains),
  setDefiChains: async (chains: Chain[]) => {
    await setStorageValue(StorageKey.defiChains, chains)
  },
}
