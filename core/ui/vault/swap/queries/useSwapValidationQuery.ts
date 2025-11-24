import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { useTransformQueriesData } from '@lib/ui/query/hooks/useTransformQueriesData'
import { t } from 'i18next'
import { useCallback } from 'react'

import { useBalanceQuery } from '../../../chain/coin/queries/useBalanceQuery'
import { useCurrentVaultCoin } from '../../state/currentVaultCoins'
import { useSwapQuoteQuery } from '../queries/useSwapQuoteQuery'
import { useFromAmount } from '../state/fromAmount'
import { useSwapFromCoin } from '../state/fromCoin'

export const useSwapValidationQuery = () => {
  const [amount] = useFromAmount()

  const [fromCoinKey] = useSwapFromCoin()
  const coin = useCurrentVaultCoin(fromCoinKey)
  const balanceQuery = useBalanceQuery(extractAccountCoinKey(coin))
  const swapQuoteQuery = useSwapQuoteQuery()

  return useTransformQueriesData(
    {
      balance: balanceQuery,
      swapQuote: swapQuoteQuery,
    },
    useCallback(
      ({ balance }) => {
        if (amount === null || amount === undefined) {
          return t('amount_required')
        }

        if (amount <= 0) {
          return t('amount_required')
        }

        const maxAmount = fromChainAmount(balance, coin.decimals)

        if (amount > maxAmount) {
          return t('insufficient_balance')
        }

        return null
      },
      [amount, coin.decimals]
    )
  )
}
