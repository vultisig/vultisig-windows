import { isChainOfKind } from '@vultisig/core-chain/ChainKind'
import { extractAccountCoinKey } from '@vultisig/core-chain/coin/AccountCoin'
import { FeeSettings } from '@vultisig/core-mpc/keysign/chainSpecific/FeeSettings'

import { isUtxoMaxSend } from '../amount/isUtxoMaxSend'
import { useSendBalanceQuery } from '../queries/useSendBalanceQuery'
import { useSendFeeEstimateQuery } from '../queries/useSendFeeEstimateQuery'
import { useSendAmount } from '../state/amount'
import { useCurrentSendCoin } from '../state/sendCoin'

type UseSendMaxAmountProps = {
  /** Fee settings chosen on Verify, which the payload is signed with. */
  feeSettings?: FeeSettings
}

/**
 * Whether Verify signs the send as a UTXO max spend (see `isUtxoMaxSend`).
 * Decided from the committed amount rather than the form, so a send that goes
 * straight to Verify is judged the same way, and against the fee at the
 * settings the payload is signed with. `null` while that fee is still loading,
 * including while a previous estimate is shown in its place. Without a balance
 * or fee there is no max to compare against, so the amount is signed as given.
 */
export const useSendMaxAmount = ({ feeSettings }: UseSendMaxAmountProps = {}):
  | boolean
  | null => {
  const coin = useCurrentSendCoin()
  const [amount] = useSendAmount()
  const isUtxo = isChainOfKind(coin.chain, 'utxo')
  const balanceQuery = useSendBalanceQuery(extractAccountCoinKey(coin))
  // Other chains never read the fee here, so they keep the form's estimate
  // rather than starting another one for their own fee settings.
  const feeEstimateQuery = useSendFeeEstimateQuery({
    feeSettings: isUtxo ? feeSettings : undefined,
  })

  if (!isUtxo || amount === null) {
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
