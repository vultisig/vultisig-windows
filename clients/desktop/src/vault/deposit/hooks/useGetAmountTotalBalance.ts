import { Chain } from '@core/chain/Chain'
import { useEffect, useState } from 'react'

import { useVaultChainCoinsQuery } from '../../queries/useVaultChainCoinsQuery'

export const useGetTotalAmountAvailableForChain = (chain: Chain) => {
  const [totalTokenAmount, setTotalTokenAmount] = useState(0)
  const [totalCurrencyAmount, setTotalCurrencyAmount] = useState(0)
  const { data: coins } = useVaultChainCoinsQuery(chain)

  useEffect(() => {
    if (!coins || coins.length === 0) return

    let tokenSum = 0
    let currencySum = 0

    for (const { amount, decimals, price = 0 } of coins) {
      const tokenAmount = Number(amount) / 10 ** decimals
      tokenSum += tokenAmount
      currencySum += tokenAmount * price
    }

    setTotalTokenAmount(tokenSum)
    setTotalCurrencyAmount(currencySum)
  }, [coins])

  return {
    totalTokenAmount,
    totalCurrencyAmount,
  }
}
