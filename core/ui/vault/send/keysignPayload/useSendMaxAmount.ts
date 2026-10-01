import { isChainOfKind } from '@vultisig/core-chain/ChainKind'
import { extractAccountCoinKey } from '@vultisig/core-chain/coin/AccountCoin'

import { isUtxoMaxSend } from '../amount/isUtxoMaxSend'
import { useSendBalanceQuery } from '../queries/useSendBalanceQuery'
import { useSendFeeEstimateQuery } from '../queries/useSendFeeEstimateQuery'
import { useSendAmount } from '../state/amount'
import { useCurrentSendCoin } from '../state/sendCoin'

/**
 * Whether Verify signs the send as a UTXO max spend (see `isUtxoMaxSend`).
 * Decided from the committed amount rather than the form, so a send that goes
 * straight to Verify is judged the same way. `null` while the fee for the
 * current receiver and memo is still loading, including while the previous
 * estimate is shown in its place. Without a balance or fee there is no max to
 * compare against, so the amount is signed as given.
 */
export const useSendMaxAmount = (): boolean | null => {
  const coin = useCurrentSendCoin()
  const [amount] = useSendAmount()
  const balanceQuery = useSendBalanceQuery(extractAccountCoinKey(coin))
  const feeEstimateQuery = useSendFeeEstimateQuery()

  if (!isChainOfKind(coin.chain, 'utxo') || amount === null) {
    return false
  }

  if (balanceQuery.error || feeEstimateQuery.error) {
    return false
  }

  const balance = balanceQuery.data
  const fee = feeEstimateQuery.isPlaceholderData
    ? undefined
    : feeEstimateQuery.data

  if (balance == null || fee == null) {
    return null
  }

  return isUtxoMaxSend({ chain: coin.chain, amount, balance, fee })
}
