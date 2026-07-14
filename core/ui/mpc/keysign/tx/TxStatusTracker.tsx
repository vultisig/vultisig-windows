import { Chain } from '@vultisig/core-chain/Chain'

import { useTxStatusQuery } from '../../../chain/tx/status/useTxStatusQuery'
import { TransactionStatusAnimation } from './TransactionStatusAnimation'

type TxStatusTrackerProps = {
  chain: Chain
  hash: string
}

export const TxStatusTracker = ({ chain, hash }: TxStatusTrackerProps) => {
  const { data } = useTxStatusQuery({ chain, hash })

  const status = data?.status ?? 'pending'

  return (
    <TransactionStatusAnimation
      // `not_found` means the node has not seen the hash yet (broadcast still
      // propagating); keep showing the pending animation until it resolves.
      status={status === 'not_found' ? 'pending' : status}
    />
  )
}
