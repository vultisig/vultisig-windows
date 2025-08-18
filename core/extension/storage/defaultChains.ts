import {
  DefaultChainsStorage,
  initialDefaultChains,
} from '@core/ui/storage/defaultChains'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { getStorageValue } from '@lib/extension/storage/get'

export const defaultChainsStorage: DefaultChainsStorage = {
  getDefaultChains: async () =>
    getStorageValue(StorageKey.defaultChains, initialDefaultChains),
}
