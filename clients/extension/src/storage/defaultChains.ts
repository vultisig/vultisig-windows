import { getPersistentState } from '@core/extension/state/persistent/getPersistentState'
import {
  DefaultChainsStorage,
  initialDefaultChains,
} from '@core/ui/storage/defaultChains'
import { StorageKey } from '@core/ui/storage/StorageKey'

export const defaultChainsStorage: DefaultChainsStorage = {
  getDefaultChains: async () =>
    getPersistentState(StorageKey.defaultChains, initialDefaultChains),
}
