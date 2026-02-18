import { FC } from 'react'

import { Transaction } from '../../types'
import { ApprovalTransactionCard } from './cards/ApprovalTransactionCard'
import { GenericTransactionCard } from './cards/GenericTransactionCard'
import { SwapTransactionCard } from './cards/SwapTransactionCard'

type Props = {
  transaction: Transaction
  chain: string
  sender: string
}

type TransactionCardComponent = FC<Props>

const cardByType: Record<string, TransactionCardComponent> = {
  swap: SwapTransactionCard,
  approval: ApprovalTransactionCard,
}

export const TransactionCard: FC<Props> = props => {
  const Component = cardByType[props.transaction.type] ?? GenericTransactionCard
  return <Component {...props} />
}
