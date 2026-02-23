import { CoinKey } from '@core/chain/coin/Coin'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { without } from '@lib/utils/array/without'
import { useCallback, useEffect, useMemo } from 'react'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { useCurrentVaultChains } from '../../state/currentVaultCoins'
import { useSwapFromCoin } from './fromCoin'

export const useSwapToCoin = () => {
  const [{ toCoin }, setViewState] = useCoreViewState<'swap'>()
  const chains = useCurrentVaultChains()
  const [fromCoinKey] = useSwapFromCoin()

  const value: CoinKey = useMemo(() => {
    if (toCoin && isOneOf(toCoin.chain, chains)) {
      return toCoin
    }

    const [chain = fromCoinKey.chain] = without(chains, fromCoinKey.chain)

    return { chain }
  }, [chains, fromCoinKey.chain, toCoin])

  useEffect(() => {
    if (!toCoin || !isOneOf(toCoin.chain, chains)) {
      setViewState(prev => ({ ...prev, toCoin: value }))
    }
  }, [value, toCoin, chains, setViewState])

  const setValue = useCallback(
    (value: CoinKey) => {
      setViewState(prev => ({ ...prev, toCoin: value }))
    },
    [setViewState]
  )

  return [value, setValue] as const
}
