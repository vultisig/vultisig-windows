import {
  CoinKey,
  coinKeyFromString,
  coinKeyToString,
} from '@core/chain/coin/Coin'
import { useAppPathParams } from '@lib/ui/navigation/hooks/useAppPathParams'
import { useCallback, useMemo } from 'react'

export const useCurrentDepositCoin = () => {
  const [{ coin }, setParams] = useAppPathParams<'deposit'>()
  const value = useMemo(() => coinKeyFromString(coin), [coin])

  const setValue = useCallback(
    (value: CoinKey) => {
      setParams({ coin: coinKeyToString(value) })
    },
    [setParams]
  )

  return [value, setValue] as const
}
