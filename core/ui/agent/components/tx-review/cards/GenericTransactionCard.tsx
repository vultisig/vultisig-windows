import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { FC } from 'react'

import { Transaction } from '../../../types'
import { TransactionDetailsSection } from '../TransactionDetailsSection'

type Props = {
  transaction: Transaction
  chain: string
  sender: string
}

export const GenericTransactionCard: FC<Props> = ({
  transaction,
  chain,
  sender,
}) => {
  return (
    <VStack gap={12}>
      <Text size={13} weight={600}>
        {transaction.label}
      </Text>
      <TransactionDetailsSection
        tx={transaction.tx_data}
        chain={chain}
        sender={sender}
        label={transaction.label}
        defaultExpanded
      />
    </VStack>
  )
}
