import {
  CoinKey,
  coinKeyFromString,
  coinKeyToString,
} from '@core/chain/coin/Coin'
import { useCorePathState } from '@core/ui/navigation/hooks/useCorePathState'
import { useCallback, useMemo } from 'react'

export const useCurrentDepositCoin = () => {
  const [{ coin }, setParams] = useCorePathState<'deposit'>()
  const value = useMemo(() => coinKeyFromString(coin), [coin])

  const setValue = useCallback(
    (value: CoinKey) => {
      setParams({ coin: coinKeyToString(value) })
    },
    [setParams]
  )

  return [value, setValue] as const
}
