import { areEqualCoins, CoinKey } from '@core/chain/coin/Coin'
import { useMemo } from 'react'

import { useCurrentVaultCoins } from './currentVaultCoins'

export const useHasVaultCoin = (coin?: CoinKey) => {
  const coins = useCurrentVaultCoins()

  return useMemo(() => {
    if (!coin) return false
    return coins.some(current => areEqualCoins(current, coin))
  }, [coin, coins])
}
