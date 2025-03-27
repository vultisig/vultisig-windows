import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { extractErrorMsg } from '@lib/utils/error/extractErrorMsg'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useBalanceQuery } from '../../../../coin/query/useBalanceQuery'
import { useCurrentVaultCoin } from '../../../state/currentVault'
import { useSwapFeesQuery } from '../../queries/useSwapFeesQuery'
import { useSwapQuoteQuery } from '../../queries/useSwapQuoteQuery'
import { useFromAmount } from '../../state/fromAmount'
import { useFromCoin } from '../../state/fromCoin'

export const useIsSwapFormDisabled = () => {
  const [amount] = useFromAmount()

  const [coinKey] = useFromCoin()
  const coin = useCurrentVaultCoin(coinKey)
  const balanceQuery = useBalanceQuery(extractAccountCoinKey(coin))
  const swapFeesQuery = useSwapFeesQuery()

  const { t } = useTranslation()

  const swapQuoteQuery = useSwapQuoteQuery()

  return useMemo(() => {
    if (!amount) {
      return t('amount_required')
    }

    if (balanceQuery.isPending || swapFeesQuery.isPending) {
      return t('loading')
    }

    if (!balanceQuery.data) {
      return extractErrorMsg(balanceQuery.error)
    }

    const maxChainAmount = balanceQuery.data
    const maxAmount = fromChainAmount(maxChainAmount, coin.decimals)

    if (amount > maxAmount) {
      return t('insufficient_balance')
    }

    if (swapQuoteQuery.isPending) {
      return t('loading')
    }

    if (!swapQuoteQuery.data) {
      return extractErrorMsg(swapQuoteQuery.error)
    }
  }, [
    amount,
    balanceQuery.data,
    balanceQuery.error,
    balanceQuery.isPending,
    coin.decimals,
    swapFeesQuery.isPending,
    swapQuoteQuery.data,
    swapQuoteQuery.error,
    swapQuoteQuery.isPending,
    t,
  ])
}
