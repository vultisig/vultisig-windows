import { Chain } from '@core/chain/Chain'
import { defaultChains } from '@core/ui/chain/state/defaultChains'

import {
  PersistentStateKey,
  usePersistentState,
} from '../../state/persistentState'

export const useDefaultChains = () => {
  return usePersistentState<Chain[]>(
    PersistentStateKey.DefaultChains,
    defaultChains
  )
}
