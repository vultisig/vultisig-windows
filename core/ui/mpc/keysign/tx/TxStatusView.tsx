import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'

import {
  TransactionStatus,
  TransactionStatusAnimation,
} from './TransactionStatusAnimation'

type TxStatusViewProps = {
  status: TransactionStatus
  /** Why the transaction failed, printed under the animation. */
  description?: string
}

/**
 * The status animation with an optional failure explanation underneath. Pure
 * presentation: callers decide the status from whichever reads apply to their
 * transaction.
 */
export const TxStatusView = ({ status, description }: TxStatusViewProps) => (
  <VStack gap={12} fullWidth>
    <TransactionStatusAnimation status={status} />
    {description ? (
      <Text
        color="shyExtra"
        size={13}
        weight={500}
        centerHorizontally
        data-testid="tx-failure-description"
      >
        {description}
      </Text>
    ) : null}
  </VStack>
)
