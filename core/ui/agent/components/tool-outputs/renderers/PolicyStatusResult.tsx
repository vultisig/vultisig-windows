import { Chain } from '@core/chain/Chain'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { MiddleTruncate } from '@lib/ui/truncate'
import { FC } from 'react'
import styled from 'styled-components'

import { ActionBar } from '../ActionBar'
import { CopyButton } from '../CopyButton'
import { ExplorerLink } from '../ExplorerLink'
import { ResultPanel } from '../ResultPanel'
import { ResultRow } from '../ResultRow'
import { ToolAction, toRecord } from '../types'

type TransactionItem = {
  status?: 'success' | 'failed' | 'pending' | string
  description?: string
  txHash?: string
  tx_hash?: string
  chain?: string
  date?: string
  created_at?: string
  error?: string
}

type PolicyStatusData = {
  transactions?: TransactionItem[]
  policyId?: string
  ui?: {
    actions?: ToolAction[]
  }
}

type Props = {
  data: unknown
}

const isPolicyStatusData = (data: unknown): data is PolicyStatusData => {
  if (typeof data !== 'object' || data === null) return false
  const obj = data as Record<string, unknown>
  if (!Array.isArray(obj.transactions)) return false
  return true
}

const getChainFromString = (chainStr: string): Chain | null => {
  const chainValues = Object.values(Chain)
  const found = chainValues.find(
    c => c.toLowerCase() === chainStr.toLowerCase()
  )
  return found ?? null
}

const formatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

const getStatusIcon = (status: string): string => {
  switch (status) {
    case 'success':
      return '✓'
    case 'failed':
      return '✗'
    case 'pending':
      return '⏳'
    default:
      return '•'
  }
}

const getStatusColor = (
  status: string
): 'success' | 'danger' | 'warning' | 'supporting' => {
  switch (status) {
    case 'success':
      return 'success'
    case 'failed':
      return 'danger'
    case 'pending':
      return 'warning'
    default:
      return 'supporting'
  }
}

export const PolicyStatusResult: FC<Props> = ({ data }) => {
  if (!isPolicyStatusData(data) || !data.transactions) {
    return null
  }

  const ui = toRecord(data.ui)
  const actions = (ui?.actions as ToolAction[] | undefined) ?? []

  return (
    <ResultPanel title="Transaction History" count={data.transactions.length}>
      {data.transactions.map((tx, index) => {
        const status = (tx.status || 'pending').toLowerCase()
        const chain = tx.chain ? getChainFromString(tx.chain) : null
        const txHash = tx.txHash || tx.tx_hash
        const date = tx.date || tx.created_at

        return (
          <ResultRow
            key={index}
            icon={
              <StatusIcon $status={status}>{getStatusIcon(status)}</StatusIcon>
            }
            extra={
              txHash &&
              chain && (
                <HStack gap={4}>
                  <CopyButton value={txHash} label="Transaction hash copied" />
                  <ExplorerLink chain={chain} entity="tx" value={txHash} />
                </HStack>
              )
            }
          >
            <VStack gap={2}>
              <HStack
                gap={8}
                alignItems="center"
                justifyContent="space-between"
              >
                <Text
                  size={14}
                  weight={500}
                  color={getStatusColor(status) as 'regular'}
                >
                  {tx.description ||
                    (status === 'success'
                      ? 'Transaction'
                      : tx.error || 'Failed')}
                </Text>
                {date && (
                  <Text size={12} color="shy">
                    {formatDate(date)}
                  </Text>
                )}
              </HStack>
              {txHash && (
                <MiddleTruncate text={txHash} color="textShy" size={12} />
              )}
              {status === 'failed' && tx.error && (
                <Text size={12} color="danger">
                  {tx.error}
                </Text>
              )}
            </VStack>
          </ResultRow>
        )
      })}
      {actions.length > 0 && (
        <VStack style={{ padding: '12px 16px' }}>
          <ActionBar actions={actions} />
        </VStack>
      )}
    </ResultPanel>
  )
}

const statusColorMap: Record<string, string> = {
  success: 'success',
  failed: 'danger',
}

const StatusIcon = styled.span<{ $status: string }>`
  font-size: 14px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: ${({ $status, theme }) => {
    const colorName = statusColorMap[$status]
    if (colorName) {
      return theme.colors[colorName as keyof typeof theme.colors]
        .getVariant({ a: () => 0.15 })
        .toCssValue()
    }
    if ($status === 'pending') return 'rgba(255, 193, 7, 0.15)'
    return getColor('mist')
  }};
  color: ${({ $status, theme }) => {
    const colorName = statusColorMap[$status]
    if (colorName) {
      return theme.colors[colorName as keyof typeof theme.colors].toCssValue()
    }
    if ($status === 'pending') return '#FFC107'
    return 'inherit'
  }};
`
