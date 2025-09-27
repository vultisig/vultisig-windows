import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { getFeeAmount } from '@core/chain/tx/fee/getFeeAmount'
import { useTransformQueriesData } from '@lib/ui/query/hooks/useTransformQueriesData'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { useCallback } from 'react'

import { useBalanceQuery } from '../../../chain/coin/queries/useBalanceQuery'
import { useKeysignUtxoInfo } from '../../../mpc/keysign/utxo/queries/keysignUtxoInfo'
import { useSendChainSpecificQuery } from '../queries/useSendChainSpecificQuery'
import { useSendAmount } from '../state/amount'
import { useCurrentSendCoin } from '../state/sendCoin'
import { capSendAmountToMax } from '../utils/capSendAmountToMax'

export const useSendCappedAmountQuery = () => {
  const coin = useCurrentSendCoin()
  const [amount] = useSendAmount()

  const chainSpecificQuery = useSendChainSpecificQuery()
  const balanceQuery = useBalanceQuery(extractAccountCoinKey(coin))
  const utxoInfoQuery = useKeysignUtxoInfo({
    chain: coin.chain,
    address: coin.address,
  })
  return useTransformQueriesData(
    {
      chainSpecific: chainSpecificQuery,
      balance: balanceQuery,
      utxoInfo: utxoInfoQuery,
    },
    useCallback(
      ({ chainSpecific, balance, utxoInfo }) => {
        const feeAmount = getFeeAmount({
          chainSpecific,
          utxoInfo,
          amount,
          chain: coin.chain,
        })

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
