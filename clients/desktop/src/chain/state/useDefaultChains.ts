import { Chain } from '@core/chain/Chain'
import { defaultChains } from '@core/ui/chain/state/defaultChains'
import { PersistentStateKey } from '@core/ui/state/PersistentStateKey'

import { usePersistentState } from '../../state/persistentState'
export const useDefaultChains = () => {
  return usePersistentState<Chain[]>(
    PersistentStateKey.DefaultChains,
    defaultChains
  )
}
