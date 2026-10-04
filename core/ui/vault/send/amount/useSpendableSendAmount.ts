import { extractAccountCoinKey } from '@vultisig/core-chain/coin/AccountCoin'

import { useSendAllowDeath } from '../allowDeath/useSendAllowDeath'
import { useIsSendFeePaidInCoin } from '../fee/useIsSendFeePaidInCoin'
import { useSendBalanceQuery } from '../queries/useSendBalanceQuery'
import { useSendAmount } from '../state/amount'
import { useCurrentSendCoin } from '../state/sendCoin'
import { adjustAmountForFee } from './adjustAmountForFee'
import { useSendMaxSendable } from './useSendMaxSendable'

/**
 * The amount the send will actually move: the entered amount, reduced to what
 * the balance still covers once the network fee — and, on chains that reap an
 * emptied account, the balance the sender must keep — is reserved out of it.
 * Tokens pay their fee from the native balance, so their entered amount is
 * spendable in full and is returned as typed — unless the fee is charged in
 * the token itself, as a gasless TON send's relay commission is.
 */
export const useSpendableSendAmount = () => {
  const coin = useCurrentSendCoin()
  const [amount] = useSendAmount()
  const balanceQuery = useSendBalanceQuery(extractAccountCoinKey(coin))
  const isFeePaidInCoin = useIsSendFeePaidInCoin()
  const { isEnabled: allowDeath } = useSendAllowDeath()
  const { get: getMaxSendable } = useSendMaxSendable()

  const balance = balanceQuery.data

  if (amount === null || balance == null || !isFeePaidInCoin) {
    return amount
  }

  const maxSendable = getMaxSendable(allowDeath)

  if (maxSendable === null) {
    return amount
  }

  return adjustAmountForFee({ amount, balance, maxSendable })
}
