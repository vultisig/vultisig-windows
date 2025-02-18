import { Chain } from '@core/chain/Chain'
import { getCoinValue } from '@core/chain/coin/utils/getCoinValue'
import { sum } from '@lib/utils/array/sum'
import { useEffect, useState } from 'react'

import { useVaultChainCoinsQuery } from '../../queries/useVaultChainCoinsQuery'

export const useGetTotalAmountAvailableForChain = (chain: Chain) => {
  const [totalAmountAvailable, setTotalAmountAvailable] = useState(0)
  const { data: coins } = useVaultChainCoinsQuery(chain)

  useEffect(() => {
    if (coins && coins?.length > 0) {
      setTotalAmountAvailable(
        coins
          ? sum(
              coins.map(({ amount, decimals, price = 0 }) =>
                getCoinValue({
                  amount,
                  decimals,
                  price,
                })
              )
            )
          : 0
      )
    }
  }, [coins])

  return totalAmountAvailable
}
