import { TransactionApproveIcon } from '@lib/ui/icons/TransactionApproveIcon'
import { TransactionReceiveIcon } from '@lib/ui/icons/TransactionReceiveIcon'
import { TransactionSendIcon } from '@lib/ui/icons/TransactionSendIcon'
import { TransactionSwapIcon } from '@lib/ui/icons/TransactionSwapIcon'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'

import { TagPill } from './styles'

export const transactionHistoryTagTypes = [
  'send',
  'receive',
  'swap',
  'approve',
] as const

export type TransactionHistoryTagType =
  (typeof transactionHistoryTagTypes)[number]

const iconMap = {
  send: TransactionSendIcon,
  receive: TransactionReceiveIcon,
  swap: TransactionSwapIcon,
  approve: TransactionApproveIcon,
} as const

const labelKeyMap = {
  send: 'send',
  receive: 'receive',
  swap: 'swap',
  approve: 'approve',
} as const

export type TransactionHistoryTagProps = {
  type: TransactionHistoryTagType
}

export const TransactionHistoryTag = ({ type }: TransactionHistoryTagProps) => {
  const { t } = useTranslation()
  const Icon = iconMap[type]
  const labelKey = labelKeyMap[type]

  return (
    <TagPill>
      <Icon style={{ fontSize: 12 }} aria-hidden />
      <Text variant="caption" color="info">
        {t(labelKey)}
      </Text>
    </TagPill>
  )
}
