import {
  CoinKey,
  coinKeyFromString,
  coinKeyToString,
} from '@core/chain/coin/Coin'
import { useCallback, useMemo } from 'react'

import { useCorePathState } from '../../../navigation/hooks/useCorePathState'

export const useCurrentSendCoin = () => {
  const [{ coin }, setParams] = useCorePathState<'send'>()

  const value = useMemo(() => coinKeyFromString(coin), [coin])

  const setValue = useCallback(
    (value: CoinKey) => {
      setParams({ coin: coinKeyToString(value) })
    },
    [setParams]
  )

  return [value, setValue] as const
}
