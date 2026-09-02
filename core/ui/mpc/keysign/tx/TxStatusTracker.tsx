import { getTxFailureDescription } from '@core/ui/chain/tx/failure/getTxFailureDescription'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { Chain } from '@vultisig/core-chain/Chain'
import { useTranslation } from 'react-i18next'

import { useTxStatusQuery } from '../../../chain/tx/status/useTxStatusQuery'
import { TransactionStatusAnimation } from './TransactionStatusAnimation'

type TxStatusTrackerProps = {
  chain: Chain
  hash: string
}

export const TxStatusTracker = ({ chain, hash }: TxStatusTrackerProps) => {
  const { t } = useTranslation()
  const { data, isPending } = useTxStatusQuery({ chain, hash })

  const status = data?.status ?? 'pending'
  const failure = status === 'error' ? data?.failure : undefined

  return (
    <VStack gap={12} fullWidth>
      <TransactionStatusAnimation
        // `not_found` means the node has not seen the hash yet (broadcast still
        // propagating); keep showing the pending animation until it resolves.
        status={
          isPending
            ? 'broadcasted'
            : status === 'not_found'
              ? 'pending'
              : status
        }
      />
      {failure ? (
        <Text
          color="shyExtra"
          size={13}
          weight={500}
          centerHorizontally
          data-testid="tx-failure-description"
        >
          {getTxFailureDescription({ failure, t })}
        </Text>
      ) : null}
    </VStack>
  )
}
