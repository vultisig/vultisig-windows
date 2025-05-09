import {
  CoinKey,
  coinKeyFromString,
  coinKeyToString,
} from '@core/chain/coin/Coin'
import { useCorePathParams } from '@core/ui/navigation/hooks/useCorePathParams'
import { useCallback, useMemo } from 'react'

export const useCurrentDepositCoin = () => {
  const [{ coin }, setParams] = useCorePathParams<'deposit'>()
  const value = useMemo(() => coinKeyFromString(coin), [coin])

  const setValue = useCallback(
    (value: CoinKey) => {
      setParams({ coin: coinKeyToString(value) })
    },
    [setParams]
  )

  return [value, setValue] as const
}
