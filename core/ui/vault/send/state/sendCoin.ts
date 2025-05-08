import {
  CoinKey,
  coinKeyFromString,
  coinKeyToString,
} from '@core/chain/coin/Coin'
import { useCallback, useMemo } from 'react'

import { useCorePathParams } from '../../../navigation/hooks/useCorePathParams'

export const useCurrentSendCoin = () => {
  const [{ coin }, setParams] = useCorePathParams<'send'>()

  const value = useMemo(() => coinKeyFromString(coin), [coin])

  const setValue = useCallback(
    (value: CoinKey) => {
      setParams({ coin: coinKeyToString(value) })
    },
    [setParams]
  )

  return [value, setValue] as const
}
