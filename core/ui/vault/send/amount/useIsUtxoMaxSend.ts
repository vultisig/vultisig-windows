import { extractAccountCoinKey } from '@vultisig/core-chain/coin/AccountCoin'

import { useSendBalanceQuery } from '../queries/useSendBalanceQuery'
import { useSendFeeEstimateQuery } from '../queries/useSendFeeEstimateQuery'
import { useCurrentSendCoin } from '../state/sendCoin'
import { isUtxoMaxSend } from './isUtxoMaxSend'
import { useSpendableSendAmount } from './useSpendableSendAmount'

/**
 * Whether the amount the send will move is a UTXO max spend (see
 * `isUtxoMaxSend`). False until the balance and fee estimate have loaded.
 */
export const useIsUtxoMaxSend = () => {
  const coin = useCurrentSendCoin()
  const amount = useSpendableSendAmount()
  const balance = useSendBalanceQuery(extractAccountCoinKey(coin)).data
  const fee = useSendFeeEstimateQuery().data

  if (amount === null || balance == null || fee == null) {
    return false
  }

  return isUtxoMaxSend({ chain: coin.chain, amount, balance, fee })
}
