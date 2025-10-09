import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { useTransformQueriesData } from '@lib/ui/query/hooks/useTransformQueriesData'
import { t } from 'i18next'
import { useCallback } from 'react'

import { useBalanceQuery } from '../../../chain/coin/queries/useBalanceQuery'
import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { useCurrentVaultCoin } from '../../state/currentVaultCoins'
import { useSwapQuoteQuery } from '../queries/useSwapQuoteQuery'
import { useFromAmount } from '../state/fromAmount'

export const useSwapValidationQuery = () => {
  const [amount] = useFromAmount()

  const [{ coin: fromCoinKey }] = useCoreViewState<'swap'>()
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
        if (!amount) {
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
