import { StorageKey } from '@core/ui/storage/StorageKey'
import { initialDefaultChains } from '@core/ui/vault/state/defaultChains'

import { getPersistentState } from '../../state/persistent/getPersistentState'

export const getDefaultChains = async () =>
  getPersistentState(StorageKey.defaultChains, initialDefaultChains)
