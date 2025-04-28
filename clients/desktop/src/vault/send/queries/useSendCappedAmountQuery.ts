import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { getFeeAmount } from '@core/chain/tx/fee/getFeeAmount'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { useTransformQueriesData } from '@lib/ui/query/hooks/useTransformQueriesData'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useCallback } from 'react'

import { useBalanceQuery } from '../../../coin/query/useBalanceQuery'
import { useSendChainSpecificQuery } from '../queries/useSendChainSpecificQuery'
import { useSendAmount } from '../state/amount'
import { useCurrentSendCoin } from '../state/sendCoin'
import { capSendAmountToMax } from '../utils/capSendAmountToMax'

export const useSendCappedAmountQuery = () => {
  const [coinKey] = useCurrentSendCoin()
  const coin = useCurrentVaultCoin(coinKey)
  const [amount] = useSendAmount()

  const chainSpecificQuery = useSendChainSpecificQuery()
  const balanceQuery = useBalanceQuery(extractAccountCoinKey(coin))

  return useTransformQueriesData(
    {
      chainSpecific: chainSpecificQuery,
      balance: balanceQuery,
    },
    useCallback(
      ({ chainSpecific, balance }) => {
        const chainAmount = toChainAmount(
          shouldBePresent(amount),
          coin.decimals
        )

        const feeAmount = getFeeAmount(chainSpecific)

        return {
          decimals: coin.decimals,
          amount: capSendAmountToMax({
            amount: chainAmount,
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
