import { rescaleChainAmount } from '@core/ui/chain/utils/rescaleChainAmount'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { useEffect, useRef } from 'react'

import { useFromAmount } from './fromAmount'
import { useSwapFromCoin } from './fromCoin'

/**
 * Keeps the stored From amount in the From coin's base units. The amount is a
 * bigint of the coin's smallest unit, so without this a reverse or a coin pick
 * with different decimals would quote and sign a wildly different amount than
 * the number the field still shows.
 */
export const FromAmountDecimalsSync = () => {
  const [fromCoinKey] = useSwapFromCoin()
  const { decimals } = useCurrentVaultCoin(fromCoinKey)
  const [, setAmount] = useFromAmount()
  const previousDecimalsRef = useRef(decimals)

  useEffect(() => {
    const fromDecimals = previousDecimalsRef.current
    if (fromDecimals === decimals) return

    previousDecimalsRef.current = decimals
    setAmount(amount =>
      amount === null
        ? null
        : rescaleChainAmount({ amount, fromDecimals, toDecimals: decimals })
    )
  }, [decimals, setAmount])

  return null
}
