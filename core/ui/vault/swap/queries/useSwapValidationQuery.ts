import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { useCombineQueries } from '@lib/ui/query/hooks/useCombineQueries'
import { t } from 'i18next'

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

  return useCombineQueries({
    queries: {
      balance: balanceQuery,
      swapQuote: swapQuoteQuery,
    },
    joinData: ({ balance }) => {
      if (amount === null || amount === undefined) {
        return t('amount_required')
      }

      if (amount <= 0n) {
        return t('amount_required')
      }

      if (amount > balance) {
        return t('insufficient_balance')
      }

      return null
    },
    eager: false,
  })
}
