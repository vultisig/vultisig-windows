import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { useBalanceQuery } from '@core/ui/chain/coin/queries/useBalanceQuery'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useCoreViewState } from '../../../../navigation/hooks/useCoreViewState'
import { useSwapFeesQuery } from '../../queries/useSwapFeesQuery'
import { useSwapQuoteQuery } from '../../queries/useSwapQuoteQuery'
import { useFromAmount } from '../../state/fromAmount'

export const useIsSwapFormDisabled = () => {
  const [amount] = useFromAmount()

  const [{ coin: fromCoinKey }] = useCoreViewState<'swap'>()
  const coin = useCurrentVaultCoin(fromCoinKey)
  const balanceQuery = useBalanceQuery(extractAccountCoinKey(coin))
  const swapFeesQuery = useSwapFeesQuery()

  const { t } = useTranslation()

  const swapQuoteQuery = useSwapQuoteQuery()

  return useMemo(() => {
    if (!amount) {
      return t('amount_required')
    }

    if (balanceQuery.isPending || swapFeesQuery.isLoading) {
      return t('loading')
    }

    if (swapFeesQuery.error) {
      return extractErrorMsg(swapFeesQuery.error)
    }

    if (!balanceQuery.data) {
      return extractErrorMsg(balanceQuery.error)
    }

    const maxChainAmount = balanceQuery.data
    const maxAmount = fromChainAmount(maxChainAmount, coin.decimals)

    if (amount > maxAmount) {
      return t('insufficient_balance')
    }

    if (swapQuoteQuery.isLoading) {
      return t('loading')
    }

    if (!swapQuoteQuery.data) {
      return swapQuoteQuery.error
        ? extractErrorMsg(swapQuoteQuery.error)
        : t('unexpected_error')
    }
  }, [
    amount,
    balanceQuery.data,
    balanceQuery.error,
    balanceQuery.isPending,
    coin.decimals,
    swapFeesQuery.error,
    swapFeesQuery.isLoading,
    swapQuoteQuery.data,
    swapQuoteQuery.error,
    swapQuoteQuery.isLoading,
    t,
  ])
}
