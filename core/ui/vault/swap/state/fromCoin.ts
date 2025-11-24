import { CoinKey } from '@core/chain/coin/Coin'
import { useCallback } from 'react'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { useCurrentVaultChains } from '../../state/currentVaultCoins'

export const useSwapFromCoin = () => {
  const [{ fromCoin }, setViewState] = useCoreViewState<'swap'>()
  const [chain] = useCurrentVaultChains()

  const value: CoinKey = fromCoin ?? { chain }

  const setValue = useCallback(
    (value: CoinKey) => {
      setViewState(prev => ({ ...prev, fromCoin: value }))
    },
    [setViewState]
  )

  return [value, setValue] as const
}
