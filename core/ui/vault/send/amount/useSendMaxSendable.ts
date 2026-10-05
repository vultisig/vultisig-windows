import { Query } from '@lib/ui/query/Query'
import { getMaxSendableAmount } from '@vultisig/core-chain/amount/getMaxSendableAmount'
import { Chain } from '@vultisig/core-chain/Chain'
import { ChainKind, getChainKind } from '@vultisig/core-chain/ChainKind'
import { NearSendLimits } from '@vultisig/core-chain/chains/near/sendLimits'
import { extractAccountCoinKey } from '@vultisig/core-chain/coin/AccountCoin'

import { useNearSendLimitsQuery } from '../queries/useNearSendLimitsQuery'
import { useSendBalanceQuery } from '../queries/useSendBalanceQuery'
import { useSendFeeEstimateQuery } from '../queries/useSendFeeEstimateQuery'
import { useCurrentSendCoin } from '../state/sendCoin'

type SendMaxSendable = {
  /** The most a native send can move; `null` while that is not known. */
  get: (allowDeath: boolean) => bigint | null
  /** What the maximum is read from is still loading. */
  isPending: boolean
  /** Why the maximum could not be read; `null` unless that failed. */
  error: unknown
}

type MaxSendableResolverInput = {
  chain: Chain
  balance: bigint | undefined
  feeEstimateQuery: Query<bigint>
  nearSendLimitsQuery: Query<NearSendLimits>
}

type MaxSendableResolver = (input: MaxSendableResolverInput) => SendMaxSendable

const getFeeBasedMaxSendable: MaxSendableResolver = ({
  chain,
  balance,
  feeEstimateQuery,
}) => ({
  get: allowDeath => {
    const fee = feeEstimateQuery.data
    if (balance == null || fee == null) {
      return null
    }
    return getMaxSendableAmount({ chain, balance, fee, allowDeath })
  },
  isPending: feeEstimateQuery.isPending,
  error: feeEstimateQuery.error,
})

const maxSendableResolvers: Partial<Record<ChainKind, MaxSendableResolver>> = {
  // NEAR also keeps back the balance backing the account's own storage, which only the chain knows.
  near: ({ nearSendLimitsQuery }) => ({
    get: () => nearSendLimitsQuery.data?.maxSendable ?? null,
    isPending: nearSendLimitsQuery.isPending,
    error: nearSendLimitsQuery.error,
  }),
}

/**
 * The most the current native send can move, resolved per chain kind: the
 * balance less the fee and whatever the chain keeps back, unless the kind
 * reads its own maximum.
 */
export const useSendMaxSendable = (): SendMaxSendable => {
  const coin = useCurrentSendCoin()
  const balanceQuery = useSendBalanceQuery(extractAccountCoinKey(coin))
  const feeEstimateQuery = useSendFeeEstimateQuery()
  const nearSendLimitsQuery = useNearSendLimitsQuery()

  const resolve =
    maxSendableResolvers[getChainKind(coin.chain)] ?? getFeeBasedMaxSendable

  return resolve({
    chain: coin.chain,
    balance: balanceQuery.data,
    feeEstimateQuery,
    nearSendLimitsQuery,
  })
}
