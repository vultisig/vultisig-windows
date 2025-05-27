import {
  DefaultChainsStorage,
  initialDefaultChains,
} from '@core/ui/storage/defaultChains'
import { StorageKey } from '@core/ui/storage/StorageKey'

import { getPersistentState } from '../state/persistent/getPersistentState'

export const defaultChainsStorage: DefaultChainsStorage = {
  getDefaultChains: async () =>
    getPersistentState(StorageKey.defaultChains, initialDefaultChains),
}
