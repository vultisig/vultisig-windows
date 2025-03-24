import { Chain } from '@core/chain/Chain'

import {
  PersistentStateKey,
  usePersistentState,
} from '../../state/persistentState'

const defaultChains = [
  Chain.Bitcoin,
  Chain.Ethereum,
  Chain.THORChain,
  Chain.Solana,
  Chain.BSC,
]

export const useDefaultChains = () => {
  return usePersistentState<Chain[]>(
    PersistentStateKey.DefaultChains,
    defaultChains
  )
}
