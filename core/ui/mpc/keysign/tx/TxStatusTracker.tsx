import { Chain } from '@core/chain/Chain'

import { useTxStatusQuery } from '../../../chain/tx/status/useTxStatusQuery'
import { TransactionStatusAnimation } from './TransactionStatusAnimation'

type TxStatusTrackerProps = {
  chain: Chain
  hash: string
}

export const TxStatusTracker = ({ chain, hash }: TxStatusTrackerProps) => {
  const { data } = useTxStatusQuery({ chain, hash })

  return <TransactionStatusAnimation status={data?.status ?? 'pending'} />
}
