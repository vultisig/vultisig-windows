import { extractAccountCoinKey } from '@vultisig/core-chain/coin/AccountCoin'

import { useIsSendFeePaidInCoin } from '../fee/useIsSendFeePaidInCoin'
import { useSendBalanceQuery } from '../queries/useSendBalanceQuery'
import { useSendFeeEstimateQuery } from '../queries/useSendFeeEstimateQuery'
import { useSendAmount } from '../state/amount'
import { useCurrentSendCoin } from '../state/sendCoin'
import { adjustAmountForFee } from './adjustAmountForFee'

/**
 * The amount the send will actually move: the entered amount, reduced to what
 * the balance still covers once the network fee is reserved out of it. Tokens
 * pay their fee from the native balance, so their entered amount is spendable
 * in full and is returned as typed — unless the fee is charged in the token
 * itself, as a gasless TON send's relay commission is.
 */
export const useSpendableSendAmount = () => {
  const coin = useCurrentSendCoin()
  const [amount] = useSendAmount()
  const balanceQuery = useSendBalanceQuery(extractAccountCoinKey(coin))
  const feeEstimateQuery = useSendFeeEstimateQuery()
  const isFeePaidInCoin = useIsSendFeePaidInCoin()

  const balance = balanceQuery.data
  const fee = feeEstimateQuery.data

  if (amount === null || balance == null || fee == null || !isFeePaidInCoin) {
    return amount
  }

  return adjustAmountForFee({ amount, balance, fee })
}
