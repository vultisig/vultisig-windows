import { useCoinPricesQuery } from '@core/ui/chain/coin/price/queries/useCoinPricesQuery'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { usePortfolioVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { useTransformQueryData } from '@lib/ui/query/hooks/useTransformQueryData'
import { fromChainAmount } from '@vultisig/core-chain/amount/fromChainAmount'
import { areEqualCoins, coinKeyToString } from '@vultisig/core-chain/coin/Coin'
import { SwapFee } from '@vultisig/core-chain/swap/SwapFee'
import { sum } from '@vultisig/lib-utils/array/sum'
import { withoutDuplicates } from '@vultisig/lib-utils/array/withoutDuplicates'
import { useCallback, useMemo } from 'react'

import { toPriceableCoin } from './toPriceableCoin'

export const useSwapFiatFeesQuery = (value: SwapFee[]) => {
  const vaultCoins = usePortfolioVaultCoins()
  const coins = useMemo(
    () =>
      withoutDuplicates(
        value.map(fee => toPriceableCoin({ fee, vaultCoins })),
        areEqualCoins
      ),
    [value, vaultCoins]
  )

  const formatAmount = useFormatFiatAmount()

  return useTransformQueryData(
    useCoinPricesQuery({ coins, eager: false }),
    useCallback(
      prices => {
        const total = sum(
          value.map(({ amount, decimals, ...coinKey }) => {
            const key = coinKeyToString(coinKey)
            const price = prices[key] ?? 0

            return price * fromChainAmount(amount, decimals)
          })
        )

        return formatAmount(total)
      },
      [formatAmount, value]
    )
  )
}
