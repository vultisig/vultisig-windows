import {
  CoinKey,
  coinKeyFromString,
  coinKeyToString,
} from '@core/chain/coin/Coin'
import { useCallback, useMemo } from 'react'

import { useAppPathParams } from '../../../navigation/hooks/useAppPathParams'

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
