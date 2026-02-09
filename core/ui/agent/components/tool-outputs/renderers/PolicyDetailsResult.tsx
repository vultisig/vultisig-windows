import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { FC } from 'react'
import styled from 'styled-components'

import { CopyButton } from '../CopyButton'
import { ResultPanel } from '../ResultPanel'
import { ResultRow } from '../ResultRow'

type PolicyDetailsData = {
  policy_id?: string
  plugin_id?: string
  plugin_name?: string
  active?: boolean
  from_asset?: string
  to_asset?: string
  amount?: string
  frequency?: string
  created_at?: string
  configuration?: Record<string, unknown>
}

type Props = {
  data: unknown
}

const isPolicyDetailsData = (data: unknown): data is PolicyDetailsData => {
  if (typeof data !== 'object' || data === null) return false
  const obj = data as Record<string, unknown>
  return typeof obj.policy_id === 'string'
}

const getPluginIcon = (pluginName?: string): string => {
  const name = pluginName?.toLowerCase() || ''
  if (name.includes('swap') || name.includes('dca')) return '🔄'
  if (name.includes('send')) return '📤'
  if (name.includes('fee')) return '💰'
  return '📋'
}

const formatDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

export const PolicyDetailsResult: FC<Props> = ({ data }) => {
  if (!isPolicyDetailsData(data)) {
    return null
  }

  const pluginName = data.plugin_name || data.plugin_id || 'Unknown'
  const isActive = data.active ?? true

  return (
    <ResultPanel title="Policy Details">
      <ResultRow
        icon={<PolicyIcon>{getPluginIcon(pluginName)}</PolicyIcon>}
        extra={
          isActive ? (
            <ActiveBadge>
              <Text size={11} color="success">
                Active
              </Text>
            </ActiveBadge>
          ) : (
            <InactiveBadge>
              <Text size={11} color="shy">
                Inactive
              </Text>
            </InactiveBadge>
          )
        }
      >
        <VStack gap={4}>
          <Text size={14} weight={500} color="regular">
            {pluginName}
          </Text>

          {data.from_asset && data.to_asset && (
            <Text size={13} color="shy">
              {data.from_asset} → {data.to_asset}
            </Text>
          )}

          <HStack gap={12} alignItems="center">
            {data.amount && (
              <Text size={12} color="shy">
                Amount: {data.amount}
              </Text>
            )}
            {data.frequency && (
              <Text size={12} color="shy">
                Frequency: {data.frequency}
              </Text>
            )}
          </HStack>

          {data.created_at && (
            <Text size={12} color="shy">
              Created: {formatDate(data.created_at)}
            </Text>
          )}

          {data.policy_id && (
            <HStack gap={4} alignItems="center">
              <Text size={11} color="shy" family="mono">
                ID: {data.policy_id.slice(0, 16)}
                {data.policy_id.length > 16 ? '...' : ''}
              </Text>
              <CopyButton value={data.policy_id} label="Policy ID copied" />
            </HStack>
          )}
        </VStack>
      </ResultRow>
    </ResultPanel>
  )
}

const PolicyIcon = styled.span`
  font-size: 20px;
`

const ActiveBadge = styled.div`
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(51, 230, 191, 0.15);
`

const InactiveBadge = styled.div`
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
`
