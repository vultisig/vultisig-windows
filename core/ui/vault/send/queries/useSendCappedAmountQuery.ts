import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { getFeeAmount } from '@core/chain/feeQuote/getFeeAmount'
import { useTransformQueriesData } from '@lib/ui/query/hooks/useTransformQueriesData'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useCallback } from 'react'

import { useBalanceQuery } from '../../../chain/coin/queries/useBalanceQuery'
import { useSendFeeQuoteQuery } from '../queries/useSendFeeQuoteQuery'
import { useSendAmount } from '../state/amount'
import { useCurrentSendCoin } from '../state/sendCoin'
import { capSendAmountToMax } from '../utils/capSendAmountToMax'

export const useSendCappedAmountQuery = () => {
  const coin = useCurrentSendCoin()
  const [amount] = useSendAmount()

  const feeQuoteQuery = useSendFeeQuoteQuery()
  const balanceQuery = useBalanceQuery(extractAccountCoinKey(coin))

  return useTransformQueriesData(
    {
      feeQuote: feeQuoteQuery,
      balance: balanceQuery,
    },
    useCallback(
      ({ feeQuote, balance }) => {
        const feeAmount = getFeeAmount(coin.chain, feeQuote)

        return {
          decimals: coin.decimals,
          amount: capSendAmountToMax({
            amount: shouldBePresent(amount),
            coin: coin,
            fee: feeAmount,
            balance,
          }),
        }
      },
      [amount, coin]
    )
  )
}
