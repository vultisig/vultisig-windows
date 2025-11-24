import { CoinKey } from '@core/chain/coin/Coin'
import { without } from '@lib/utils/array/without'
import { useCallback, useMemo } from 'react'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { useCurrentVaultChains } from '../../state/currentVaultCoins'
import { useSwapFromCoin } from './fromCoin'

export const useSwapToCoin = () => {
  const [{ toCoin }, setViewState] = useCoreViewState<'swap'>()
  const chains = useCurrentVaultChains()
  const [fromCoinKey] = useSwapFromCoin()

  const value: CoinKey = useMemo(() => {
    if (toCoin) return toCoin

    const [chain = fromCoinKey.chain] = without(chains, fromCoinKey.chain)

    return { chain }
  }, [chains, fromCoinKey.chain, toCoin])

  const setValue = useCallback(
    (value: CoinKey) => {
      setViewState(prev => ({ ...prev, toCoin: value }))
    },
    [setViewState]
  )

  return [value, setValue] as const
}
