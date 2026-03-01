import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { areEqualCoins } from '@core/chain/coin/Coin'
import { useCombineQueries } from '@lib/ui/query/hooks/useCombineQueries'
import { t } from 'i18next'

import { useBalanceQuery } from '../../../chain/coin/queries/useBalanceQuery'
import { useCurrentVaultCoin } from '../../state/currentVaultCoins'
import { useSwapQuoteQuery } from '../queries/useSwapQuoteQuery'
import { useFromAmount } from '../state/fromAmount'
import { useSwapFromCoin } from '../state/fromCoin'
import { useSwapToCoin } from '../state/toCoin'

export const useSwapValidationQuery = () => {
  const [amount] = useFromAmount()

  const [fromCoinKey] = useSwapFromCoin()
  const [toCoinKey] = useSwapToCoin()
  const coin = useCurrentVaultCoin(fromCoinKey)
  const balanceQuery = useBalanceQuery(extractAccountCoinKey(coin))
  const swapQuoteQuery = useSwapQuoteQuery()

  const combined = useCombineQueries({
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

  if (areEqualCoins(fromCoinKey, toCoinKey)) {
    return {
      data: t('swap_same_asset'),
      isPending: false,
      error: null,
    }
  }
  return combined
}
