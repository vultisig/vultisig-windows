import { getMaxSendableAmount } from '@vultisig/core-chain/amount/getMaxSendableAmount'
import { isChainOfKind } from '@vultisig/core-chain/ChainKind'
import { extractAccountCoinKey } from '@vultisig/core-chain/coin/AccountCoin'

import { useNearSendLimitsQuery } from '../queries/useNearSendLimitsQuery'
import { useSendBalanceQuery } from '../queries/useSendBalanceQuery'
import { useSendFeeEstimateQuery } from '../queries/useSendFeeEstimateQuery'
import { useCurrentSendCoin } from '../state/sendCoin'

type SendMaxSendable = {
  /** The most a native send can move; `null` while that is not known. */
  get: (allowDeath: boolean) => bigint | null
  isPending: boolean
  error: unknown
}

/**
 * The most the current native send can move: the balance less the fee and
 * whatever the chain keeps back. NEAR reads its own maximum, since it also
 * keeps back the balance backing the account's storage, which only the chain
 * knows.
 */
export const useSendMaxSendable = (): SendMaxSendable => {
  const coin = useCurrentSendCoin()
  const balanceQuery = useSendBalanceQuery(extractAccountCoinKey(coin))
  const feeEstimateQuery = useSendFeeEstimateQuery()
  const nearSendLimitsQuery = useNearSendLimitsQuery()

  if (isChainOfKind(coin.chain, 'near')) {
    return {
      get: () => nearSendLimitsQuery.data?.maxSendable ?? null,
      isPending: nearSendLimitsQuery.isPending,
      error: nearSendLimitsQuery.error,
    }
  }

  return {
    get: allowDeath => {
      const balance = balanceQuery.data
      const fee = feeEstimateQuery.data
      if (balance == null || fee == null) {
        return null
      }
      return getMaxSendableAmount({
        chain: coin.chain,
        balance,
        fee,
        allowDeath,
      })
    },
    isPending: feeEstimateQuery.isPending,
    error: feeEstimateQuery.error,
  }
}
