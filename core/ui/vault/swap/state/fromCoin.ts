import { CoinKey } from '@core/chain/coin/Coin'
import { isOneOf } from '@lib/utils/array/isOneOf'
import { useCallback, useEffect, useMemo } from 'react'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { useCurrentVaultChains } from '../../state/currentVaultCoins'

export const useSwapFromCoin = () => {
  const [{ fromCoin }, setViewState] = useCoreViewState<'swap'>()
  const chains = useCurrentVaultChains()
  const [chain] = chains

  const value: CoinKey = useMemo(() => {
    if (fromCoin && isOneOf(fromCoin.chain, chains)) {
      return fromCoin
    }
    return { chain }
  }, [chains, chain, fromCoin])

  useEffect(() => {
    if (!fromCoin || !isOneOf(fromCoin.chain, chains)) {
      setViewState(prev => ({ ...prev, fromCoin: value }))
    }
  }, [value, fromCoin, chains, setViewState])

  const setValue = useCallback(
    (value: CoinKey) => {
      setViewState(prev => ({ ...prev, fromCoin: value }))
    },
    [setViewState]
  )

  return [value, setValue] as const
}
