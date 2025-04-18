import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { areEqualCoins, coinKeyToString } from '@core/chain/coin/Coin'
import { useTransformQueryData } from '@lib/ui/query/hooks/useTransformQueryData'
import { sum } from '@lib/utils/array/sum'
import { withoutDuplicates } from '@lib/utils/array/withoutDuplicates'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { getRecordSize } from '@lib/utils/record/getRecordSize'
import { useCallback, useMemo } from 'react'

import { useFormatFiatAmount } from '../../../chain/ui/hooks/useFormatFiatAmount'
import { useCoinPricesQuery } from '../../../coin/query/useCoinPricesQuery'
import { useCurrentVaultCoins } from '../../state/currentVaultCoins'
import { SwapFee } from '../types/SwapFee'

export const useSwapFiatFeesQuery = (value: SwapFee[]) => {
  const vaultCoins = useCurrentVaultCoins()
  const coins = useMemo(
    () =>
      withoutDuplicates(
        value.map(key => {
          const coin = shouldBePresent(
            vaultCoins.find(coin => areEqualCoins(coin, key))
          )

          return coin
        }),
        areEqualCoins
      ),
    [value, vaultCoins]
  )

  const formatAmount = useFormatFiatAmount()

  return useTransformQueryData(
    useCoinPricesQuery({ coins }),
    useCallback(
      prices => {
        if (coins.length !== getRecordSize(prices)) {
          throw new Error('Failed to load prices')
        }

        const total = sum(
          value.map(({ amount, decimals, ...coinKey }) => {
            const key = coinKeyToString(coinKey)
            const price = prices[key]

            return price * fromChainAmount(amount, decimals)
          })
        )

        return formatAmount(total)
      },
      [coins.length, formatAmount, value]
    )
  )
}
