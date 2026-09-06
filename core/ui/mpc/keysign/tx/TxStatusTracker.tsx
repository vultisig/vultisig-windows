import { Chain } from '@vultisig/core-chain/Chain'
import { TxStatusResult } from '@vultisig/core-chain/tx/status/resolver'
import { match } from '@vultisig/lib-utils/match'

import { useTxStatusQuery } from '../../../chain/tx/status/useTxStatusQuery'
import {
  TransactionStatus,
  TransactionStatusAnimation,
} from './TransactionStatusAnimation'

const toAnimationStatus = (
  status: TxStatusResult['status']
): TransactionStatus =>
  match<TxStatusResult['status'], TransactionStatus>(status, {
    pending: () => 'pending',
    success: () => 'success',
    error: () => 'error',
    // The node has not seen the hash yet (broadcast still propagating); keep
    // showing the pending animation until it resolves.
    not_found: () => 'pending',
    // Past its expiry a raw transaction can never be included — that is a
    // failure, not a slow confirmation.
    expired: () => 'error',
  })

type TxStatusTrackerProps = {
  chain: Chain
  hash: string
}

export const TxStatusTracker = ({ chain, hash }: TxStatusTrackerProps) => {
  const { data, isPending } = useTxStatusQuery({ chain, hash })

  const status = data?.status ?? 'pending'

  return (
    <TransactionStatusAnimation
      status={isPending ? 'broadcasted' : toAnimationStatus(status)}
    />
  )
}
