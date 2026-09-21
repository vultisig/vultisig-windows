import { getTxFailureDescription } from '@core/ui/chain/tx/failure/getTxFailureDescription'
import { Chain } from '@vultisig/core-chain/Chain'
import { useTranslation } from 'react-i18next'

import { useTxStatusQuery } from '../../../chain/tx/status/useTxStatusQuery'
import { TxStatusView } from './TxStatusView'

type TxStatusTrackerProps = {
  chain: Chain
  hash: string
  /** Solana only: lets the poll settle on `expired` past the blockhash deadline. */
  lastValidBlockHeight?: number
}

/**
 * Live status animation for a just-broadcast transaction, with the chain's
 * failure reason underneath when it reverts. Keeps showing "pending" while the
 * hash is merely unindexed, and treats an expired transaction as a failure.
 */
export const TxStatusTracker = ({
  chain,
  hash,
  lastValidBlockHeight,
}: TxStatusTrackerProps) => {
  const { t } = useTranslation()
  const { data, isPending } = useTxStatusQuery({
    chain,
    hash,
    lastValidBlockHeight,
  })

  const status = data?.status ?? 'pending'
  const failure = status === 'error' ? data?.failure : undefined

  return (
    <TxStatusView
      // `not_found` means the node has not seen the hash yet (broadcast still
      // propagating); keep showing the pending animation until it resolves.
      status={
        isPending
          ? 'broadcasted'
          : status === 'not_found'
            ? 'pending'
            : status === 'expired'
              ? 'error'
              : status
      }
      description={
        failure ? getTxFailureDescription({ failure, t }) : undefined
      }
    />
  )
}
