import { ListItem } from '@lib/ui/list/item'
import { MiddleTruncate } from '@lib/ui/truncate'
import { ReactNode } from 'react'

type TransactionOverviewItemProps = {
  label: ReactNode
  value: ReactNode
  truncateValue?: boolean
}

export const TransactionOverviewItem = ({
  label,
  value,
  truncateValue,
}: TransactionOverviewItemProps) => {
  return (
    <ListItem
      title={label}
      styles={{ title: { color: 'textShy' } }}
      extra={
        truncateValue ? (
          <MiddleTruncate size={14} text={String(value)} weight={500} />
        ) : (
          value
        )
      }
    />
  )
}
