import { getMaxSendableAmount } from '@vultisig/core-chain/amount/getMaxSendableAmount'
import { extractAccountCoinKey } from '@vultisig/core-chain/coin/AccountCoin'

import { useSendBalanceQuery } from '../queries/useSendBalanceQuery'
import { useSendFeeEstimateQuery } from '../queries/useSendFeeEstimateQuery'
import { useSendAmount } from '../state/amount'
import { useCurrentSendCoin } from '../state/sendCoin'
import { useSendAllowDeath } from './useSendAllowDeath'

type AllowDeathSendAmount = {
  /**
   * The whole balance less the fee of the allow-death call. `null` while the
   * option is off or the balance or that fee is not known yet.
   */
  target: bigint | null
  /**
   * The option is on but the amount does not hold the target yet, so the send
   * must not go ahead: an allow-death transfer of any other amount could leave
   * a remainder the chain destroys.
   */
  isSyncing: boolean
}

/**
 * The amount an account-emptying send moves. It waits for the fee of the
 * allow-death call itself rather than the keep-alive estimate the fee query
 * still shows as placeholder data right after the option is turned on.
 */
export const useAllowDeathSendAmount = (): AllowDeathSendAmount => {
  const coin = useCurrentSendCoin()
  const { isEnabled } = useSendAllowDeath()
  const [amount] = useSendAmount()
  const balanceQuery = useSendBalanceQuery(extractAccountCoinKey(coin))
  const feeEstimateQuery = useSendFeeEstimateQuery()

  const balance = balanceQuery.data
  const fee = feeEstimateQuery.isPlaceholderData
    ? undefined
    : feeEstimateQuery.data

  const target =
    isEnabled && balance != null && fee != null
      ? getMaxSendableAmount({
          chain: coin.chain,
          balance,
          fee,
          allowDeath: true,
        })
      : null

  // A balance that cannot cover the fee has nothing to sync to; the form's
  // balance check reports that on its own.
  const isSyncing =
    isEnabled && (target === null || (target > 0n && amount !== target))

  return { target, isSyncing }
}
